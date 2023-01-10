import moment from "moment";

const DatesMixin = {
    data() {
        return {
            week: [],
        }
    },
    methods: {
        getWeekDay(date) {
            return ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'][moment(date).day()];
        },
        getWeekDayFull(date) {
            return ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'][moment(date).day()] || '';
        },
        getFullDate(date) {
            return moment(date).format('DD.MM.YYYY');
        },
        getDayMonthString(date) {
            return moment(date).format('DD.MM');
        },
        getDbDate(date) {
            return moment(date).format('YYYY-MM-DD');

        },
        getStartWeekday(year) {
            return moment(year + '-09-01').weekday()
        },
        fillWeek(date) {
            let momentDate = moment(date);
            if (momentDate.weekday() === 0) momentDate.add(1, 'days')

            this.week = [{
                date: this.getDbDate(momentDate),
                weekDay: this.getWeekDay(momentDate),
            }];
            while (this.week.length < 6) {
                momentDate = momentDate.add(1, 'days');
                if (momentDate.weekday() === 0) continue;
                this.week.push({
                        date: this.getDbDate(momentDate),
                        weekDay: this.getWeekDay(momentDate),
                    }
                )
            }
        },
        fillStudyWeek(date) {
            let momentDate = moment(date);
            let year = momentDate.year();
            if (momentDate.month() < 9) {
                year--;
            }
            let startWeekday = this.getStartWeekday(year);
            if (momentDate.weekday() !== startWeekday) {
                momentDate.weekday(this.getStartWeekday(year)) // set week number
            }
            if (momentDate.weekday() === 0) momentDate.date(momentDate.date() + 1)

            this.week = [{
                date: this.getDbDate(momentDate),
                weekDay: this.getWeekDay(momentDate),
            }];
            while (this.week.length < 6) {
                momentDate = momentDate.add(1, 'days');
                if (momentDate.weekday() === 0) continue;
                this.week.push({
                        date: this.getDbDate(momentDate),
                        weekDay: this.getWeekDay(momentDate),
                    }
                )
            }
        }
    }
}

export default DatesMixin;