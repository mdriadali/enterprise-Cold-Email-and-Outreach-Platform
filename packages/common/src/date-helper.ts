import { DateTime } from "luxon";

export class DateHelper {
    static toUtcDate(date: string, timezone: string): Date {
        return DateTime
            .fromISO(date, { zone: timezone })
            .startOf("day")
            .toUTC()
            .toJSDate();
    }
    static toLocalDate(date: Date, timezone: string): string {
        return DateTime
            .fromJSDate(date)
            .setZone(timezone)
            .toFormat("yyyy-MM-dd");
    }
    static getUtcDateTime(date: string, hour: number, timezone: string): Date {
        return DateTime.fromISO(date, { zone: timezone, })
            .set({
                hour,
                minute: 0,
                second: 0,
                millisecond: 0,
            })
            .toUTC()
            .toJSDate();
    }

    static fromUtc(date: Date, timezone: string) {
        return DateTime
            .fromJSDate(date)
            .setZone(timezone);
    }

    static startOfToday() {
        const startOfToday = new Date();
        startOfToday.setUTCHours(0, 0, 0, 0);
        return startOfToday
    }
    static endOfToday() {
        const endOfToday = new Date();
        endOfToday.setUTCHours(23, 59, 59, 999)
        return endOfToday
    }



    static startOfTomorrow(startOfToday: Date) {
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);
        return startOfTomorrow
    }


}