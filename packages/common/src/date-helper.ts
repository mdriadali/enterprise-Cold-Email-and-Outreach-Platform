import { DateTime } from "luxon";

export class DateHelper {
    static toUtcDate(date: string, timezone: string): Date {
        return DateTime
            .fromISO(date, { zone: timezone })
            .startOf("day")
            .toUTC()
            .toJSDate();
    }

    static fromUtc(date: Date, timezone: string) {
        return DateTime
            .fromJSDate(date)
            .setZone(timezone);
    }
}