import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface TimeSplitInputProps {
    onChange: (time: string) => void; // now emits full timestamp string
    initialTime?: string | number | Date;
}

function clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
}

function normalizeTime(value?: string | number | Date): [string, string, string] {
    if (!value) return ["00", "00", "00"];

    let str: string;
    if (typeof value === "string") str = value;
    else if (value instanceof Date) str = value.toTimeString().slice(0, 8);
    else str = new Date(value).toTimeString().slice(0, 8);

    const [hh = "00", mm = "00", ss = "00"] = str.split(":");
    return [
        String(clamp(Number(hh), 0, 23)).padStart(2, "0"),
        String(clamp(Number(mm), 0, 59)).padStart(2, "0"),
        String(clamp(Number(ss), 0, 59)).padStart(2, "0"),
    ];
}

export function TimeSplitInput({ onChange, initialTime }: TimeSplitInputProps) {
    const [hours, setHours] = useState("00");
    const [minutes, setMinutes] = useState("00");
    const [seconds, setSeconds] = useState("00");

    const hRef = useRef<HTMLInputElement | null>(null);
    const mRef = useRef<HTMLInputElement | null>(null);
    const sRef = useRef<HTMLInputElement | null>(null);

    // local function: convert HH:MM:SS → YYYY-MM-DDTHH:MM:SS.000
    const addTodayDateToTime = (time: string): string => {
        const now = new Date();
        const [hh, mm, ss = "00"] = time.split(":");

        const h = clamp(Number(hh), 0, 23);
        const m = clamp(Number(mm), 0, 59);
        const s = clamp(Number(ss), 0, 59);

        return `${now.getFullYear()}-${(now.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}T${h
                .toString()
                .padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
                    .toString()
                    .padStart(2, "0")}.000`;
    };

    // initialize from initialTime
    useEffect(() => {
        const [h, m, s] = normalizeTime(initialTime);
        setHours(h);
        setMinutes(m);
        setSeconds(s);
    }, [initialTime]);

    // helper: move focus to next field
    const focusNext = (ref?: React.RefObject<HTMLInputElement | null>) => {
        if (ref?.current) {
            ref.current.focus();
            ref.current.select();
        }
    };

    // handle typing without clamping yet
    const handleTyping = (
        setter: (v: string) => void,
        max: number,
        nextRef?: React.RefObject<HTMLInputElement | null>
    ) => (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, "").slice(0, 2);
        setter(val);

        if (val.length === 2) focusNext(nextRef);
    };

    // handle blur / commit → clamp + emit full timestamp
    const handleBlur = (
        value: string,
        setter: (v: string) => void,
        max: number
    ) => {
        const num = clamp(Number(value || 0), 0, max);
        const formatted = String(num).padStart(2, "0");
        setter(formatted);

        // emit full timestamp
        const timeString = `${setter === setHours ? formatted : hours}:${setter === setMinutes ? formatted : minutes}:${setter === setSeconds ? formatted : seconds}`;
        onChange(addTodayDateToTime(timeString));
    };

    return (
        <div className="flex items-center gap-1">
            <Input
                ref={hRef}
                value={hours}
                onChange={handleTyping(setHours, 23, mRef)}
                onBlur={() => handleBlur(hours, setHours, 23)}
                className="w-14 text-center"
                inputMode="numeric"
            />
            <span>:</span>
            <Input
                ref={mRef}
                value={minutes}
                onChange={handleTyping(setMinutes, 59, sRef)}
                onBlur={() => handleBlur(minutes, setMinutes, 59)}
                className="w-14 text-center"
                inputMode="numeric"
            />
            <span>:</span>
            <Input
                ref={sRef}
                value={seconds}
                onChange={handleTyping(setSeconds, 59)}
                onBlur={() => handleBlur(seconds, setSeconds, 59)}
                className="w-14 text-center"
                inputMode="numeric"
            />
        </div>
    );
}
