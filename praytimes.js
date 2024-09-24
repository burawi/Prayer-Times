'use strict';

var DMath = {
    dtr: function(d) { return (d * Math.PI) / 180.0; },
    rtd: function(r) { return (r * 180.0) / Math.PI; },
    sin: function(d) { return Math.sin(this.dtr(d)); },
    cos: function(d) { return Math.cos(this.dtr(d)); },
    tan: function(d) { return Math.tan(this.dtr(d)); },
    arcsin: function(d) { return this.rtd(Math.asin(d)); },
    arccos: function(d) { return this.rtd(Math.acos(d)); },
    arctan: function(d) { return this.rtd(Math.atan(d)); },
    arccot: function(x) { return this.rtd(Math.atan(1/x)); },
    arctan2: function(y, x) { return this.rtd(Math.atan2(y, x)); },
    fixAngle: function(a) { return this.fix(a, 360); },
    fixHour:  function(a) { return this.fix(a, 24 ); },
    fix: function(a, b) { 
        a = a- b* (Math.floor(a/ b));
        return (a < 0) ? a+ b : a;
    }
};

export class PrayTimes {
    constructor(method) {
        this.timeNames = {
            imsak    : 'Imsak',
            fajr     : 'Fajr',
            sunrise  : 'Sunrise',
            dhuhr    : 'Dhuhr',
            asr      : 'Asr',
            sunset   : 'Sunset',
            maghrib  : 'Maghrib',
            isha     : 'Isha',
            midnight : 'Midnight'
        };

        this.methods = {
            MWL: {
                name: 'Muslim World League',
                params: { fajr: 18, isha: 17 }
            },
            ISNA: {
                name: 'Islamic Society of North America (ISNA)',
                params: { fajr: 15, isha: 15 }
            },
            Egypt: {
                name: 'Egyptian General Authority of Survey',
                params: { fajr: 19.5, isha: 17.5 }
            },
            Makkah: {
                name: 'Umm Al-Qura University, Makkah',
                params: { fajr: 18.5, isha: '90 min' }
            },
            Karachi: {
                name: 'University of Islamic Sciences, Karachi',
                params: { fajr: 18, isha: 18 }
            },
            Tehran: {
                name: 'Institute of Geophysics, University of Tehran',
                params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' }
            },
            Jafari: {
                name: 'Shia Ithna-Ashari, Leva Institute, Qum',
                params: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' }
            },
            DIYANET: {
                name: 'Diyanet İşleri Rehberliği',
                params: { fajr: 18, isha: 17 },
                offset: {
                    sunrise: -7,
                    dhuhr: 5,
                    asr: 5,
                    maghrib: 7,
                }
            }
        };

        this.defaultParams = {
            maghrib: '0 min', 
            midnight: 'Standard'
        };

        this.calcMethod = 'MWL';
        this.setting = {  
            imsak    : '10 min',
            dhuhr    : '0 min',  
            asr      : 'Standard',
            highLats : 'NightMiddle'
        };

        this.timeFormat = '24h';
        this.timeSuffixes = ['am', 'pm'];
        this.invalidTime =  '-----';

        this.numIterations = 1;
        this.offset = {};

        this.lat = undefined;
        this.lng = undefined;
        this.elv = undefined;
        this.timeZone = undefined;
        this.jDate = undefined;

        this.setMethod(method || 'MWL');
    }

    setMethod(method) {
        if (this.methods[method]) {
            this.adjust(this.methods[method].params);
            this.tune(this.methods[method].offset || {});
            this.calcMethod = method;
        }
    }

    adjust(params) {
        for (var id in params)
            this.setting[id] = params[id];
    }

    tune(timeOffsets) {
        for (var i in this.timeNames)
            this.offset[i] = 0;
        
        for (var i in timeOffsets)
            this.offset[i] = timeOffsets[i];
    }

    getMethod() { 
        return this.calcMethod; 
    }

    getSetting() { 
        return this.setting; 
    }

    getOffsets() { 
        return this.offset; 
    }

    getDefaults() { 
        return this.methods; 
    }

    getTimes(date, coords, timezone, dst, format) {
        this.lat = 1* coords[0];
        this.lng = 1* coords[1]; 
        this.elv = coords[2] ? 1* coords[2] : 0;
        this.timeFormat = format || this.timeFormat;
        if (date.constructor === Date)
            date = [date.getFullYear(), date.getMonth()+ 1, date.getDate()];
        if (typeof(timezone) == 'undefined' || timezone == 'auto')
            timezone = this.getTimeZone(date);
        if (typeof(dst) == 'undefined' || dst == 'auto') 
            dst = this.getDst(date);
        this.timeZone = 1* timezone+ (1* dst ? 1 : 0);
        this.jDate = this.julian(date[0], date[1], date[2])- this.lng/ (15* 24);
        
        return this.computeTimes();
    }

    getFormattedTime(time, format, suffixes) {
        if (isNaN(time))
            return this.invalidTime;
        if (format == 'Float') return time;
        suffixes = suffixes || this.timeSuffixes;

        time = DMath.fixHour(time+ 0.5/ 60);  // add 0.5 minutes to round
        var hours = Math.floor(time); 
        var minutes = Math.floor((time- hours)* 60);
        var suffix = (format == '12h') ? suffixes[hours < 12 ? 0 : 1] : '';
        var hour = (format == '24h') ? this.twoDigitsFormat(hours) : ((hours+ 12 -1)% 12+ 1);
        return hour+ ':'+ this.twoDigitsFormat(minutes)+ (suffix ? ' '+ suffix : '');
    }

    midDay(time) {
        var eqt = this.sunPosition(this.jDate + time).equation;
        var noon = DMath.fixHour(12 - eqt);
        return noon;
    }

    sunAngleTime(angle, time, direction) {
        var decl = this.sunPosition(this.jDate + time).declination;
        var noon = this.midDay(time);
        var t = 1/15 * DMath.arccos((-DMath.sin(angle)- DMath.sin(decl)* DMath.sin(this.lat))/
                (DMath.cos(decl)* DMath.cos(this.lat)));
        return noon+ (direction == 'ccw' ? -t : t);
    }

    asrTime(factor, time) { 
        var decl = this.sunPosition(this.jDate + time).declination;
        var angle = -DMath.arccot(factor + DMath.tan(Math.abs(this.lat - decl)));
        return this.sunAngleTime(angle, time);
    }

    sunPosition(jd) {
        var D = jd - 2451545.0;
        var g = DMath.fixAngle(357.529 + 0.98560028* D);
        var q = DMath.fixAngle(280.459 + 0.98564736* D);
        var L = DMath.fixAngle(q + 1.915* DMath.sin(g) + 0.020* DMath.sin(2*g));

        var R = 1.00014 - 0.01671* DMath.cos(g) - 0.00014* DMath.cos(2*g);
        var e = 23.439 - 0.00000036* D;

        var RA = DMath.arctan2(DMath.cos(e)* DMath.sin(L), DMath.cos(L))/ 15;
        var eqt = q/15 - DMath.fixHour(RA);
        var decl = DMath.arcsin(DMath.sin(e)* DMath.sin(L));

        return {declination: decl, equation: eqt};
    }

    julian(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        };
        var A = Math.floor(year/ 100);
        var B = 2- A+ Math.floor(A/ 4);

        var JD = Math.floor(365.25* (year+ 4716))+ Math.floor(30.6001* (month+ 1))+ day+ B- 1524.5;
        return JD;
    }

    computePrayerTimes(times) {
        times = this.dayPortion(times);
        var params  = this.setting;
        
        var imsak   = this.sunAngleTime(this.eval(params.imsak), times.imsak, 'ccw');
        var fajr    = this.sunAngleTime(this.eval(params.fajr), times.fajr, 'ccw');
        var sunrise = this.sunAngleTime(this.riseSetAngle(), times.sunrise, 'ccw');  
        var dhuhr   = this.midDay(times.dhuhr);
        var asr     = this.asrTime(this.asrFactor(params.asr), times.asr);
        var sunset  = this.sunAngleTime(this.riseSetAngle(), times.sunset);;
        var maghrib = this.sunAngleTime(this.riseSetAngle(), times.maghrib);
        var isha    = this.sunAngleTime(this.eval(params.isha), times.isha);

        return {
            imsak: imsak, fajr: fajr, sunrise: sunrise, dhuhr: dhuhr, 
            asr: asr, sunset: sunset, maghrib: maghrib, isha: isha
        };
    }

    computeTimes() {
        var times = { 
            imsak: 5, fajr: 5, sunrise: 6, dhuhr: 12, 
            asr: 13, sunset: 18, maghrib: 18, isha: 18
        };

        for (var i=1 ; i<=this.numIterations ; i++) 
            times = this.computePrayerTimes(times);

        times = this.adjustTimes(times);
        
        times.midnight = (this.setting.midnight == 'Jafari') ? 
                times.sunset+ this.timeDiff(times.sunset, times.fajr)/ 2 :
                times.sunset+ this.timeDiff(times.sunset, times.sunrise)/ 2;

        times = this.tuneTimes(times);
        return this.modifyFormats(times);
    }

    adjustTimes(times) {
        var params = this.setting;
        for (var i in times)
            times[i] += this.timeZone - this.lng/ 15;
            
        if (params.highLats != 'None')
            times = this.adjustHighLats(times);
            
        if (this.isMin(params.imsak))
            times.imsak = times.fajr - this.eval(params.imsak)/ 60;
        if (this.isMin(params.maghrib))
            times.maghrib = times.sunset + this.eval(params.maghrib)/ 60;
        if (this.isMin(params.isha))
            times.isha = times.maghrib + this.eval(params.isha)/ 60;
        times.dhuhr += this.eval(params.dhuhr)/ 60; 

        return times;
    }

    asrFactor(asrParam) {
        var factor = {Standard: 1, Hanafi: 2}[asrParam];
        return factor || this.eval(asrParam);
    }

    riseSetAngle() {
        var angle = 0.0347* Math.sqrt(this.elv);
        return 0.833+ angle;
    }

    tuneTimes(times) {
        for (var i in times)
            times[i] += this.offset[i]/ 60; 
        return times;
    }

    modifyFormats(times) {
        for (var i in times)
            times[i] = this.getFormattedTime(times[i], this.timeFormat); 
        return times;
    }

    adjustHighLats(times) {
        var params = this.setting;
        var nightTime = this.timeDiff(times.sunset, times.sunrise); 

        times.imsak = this.adjustHLTime(times.imsak, times.sunrise, this.eval(params.imsak), nightTime, 'ccw');
        times.fajr  = this.adjustHLTime(times.fajr, times.sunrise, this.eval(params.fajr), nightTime, 'ccw');
        times.isha  = this.adjustHLTime(times.isha, times.sunset, this.eval(params.isha), nightTime);
        times.maghrib = this.adjustHLTime(times.maghrib, times.sunset, this.eval(params.maghrib), nightTime);
        
        return times;
    }

    adjustHLTime(time, base, angle, night, direction) {
        var portion = this.nightPortion(angle, night);
        var timeDiff = (direction == 'ccw') ? 
            this.timeDiff(time, base):
            this.timeDiff(base, time);
        if (isNaN(time) || timeDiff > portion) 
            time = base + (direction == 'ccw' ? -portion : portion);
        return time;
    }

    nightPortion(angle, night) {
        var method = this.setting.highLats;
        var portion = 1/2;
        if (method == 'AngleBased')
            portion = 1/60 * angle;
        if (method == 'OneSeventh')
            portion = 1/7;
        return portion * night;
    }

    dayPortion(times) {
        for (var i in times)
            times[i] /= 24;
        return times;
    }

    getTimeZone(date) {
        var year = date[0];
        var t1 = this.gmtOffset([year, 0, 1]);
        var t2 = this.gmtOffset([year, 6, 1]);
        return Math.min(t1, t2);
    }

    getDst(date) {
        return 1 * (this.gmtOffset(date) != this.getTimeZone(date));
    }

    gmtOffset(date) {
        var localDate = new Date(date[0], date[1] - 1, date[2], 12, 0, 0, 0);
        var GMTString = localDate.toGMTString();
        var GMTDate = new Date(GMTString.substring(0, GMTString.lastIndexOf(' ') - 1));
        var hoursDiff = (localDate - GMTDate) / (1000 * 60 * 60);
        return hoursDiff;
    }

    eval(str) {
        return 1 * (str + '').split(/[^0-9.+-]/)[0];
    }

    isMin(arg) {
        return (arg + '').indexOf('min') != -1;
    }

    timeDiff(time1, time2) {
        return DMath.fixHour(time2 - time1);
    }

    twoDigitsFormat(num) {
        return (num < 10) ? '0' + num : num;
    }
}