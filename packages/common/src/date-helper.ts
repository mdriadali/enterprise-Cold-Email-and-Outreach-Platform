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
}