import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { Fireworks } from "@fireworks-js/react";
import { clamp } from "lodash";

import "./styles.css";
import queryString from "query-string";

const formatTimeElement = (val: number) => val.toString().padStart(2, "0");

type RemainingTime = [number, number, number];

type CountdownProps = {
  target: DateTime;
};

const Countdown = ({ target }: CountdownProps) => {
  const initialDiff = useRef(target.diffNow().shiftToAll().toObject()).current;
  const [[hours, minutes, seconds], setNextTime] = useState<RemainingTime>([
    initialDiff.hours ?? 0,
    initialDiff.minutes ?? 0,
    initialDiff.seconds ?? 0,
  ]);
  const interval = useRef<ReturnType<typeof setInterval>>();

  const celebrate = hours <= 0 && minutes <= 0 && seconds <= 0;

  useEffect(() => {
    if (celebrate) {
      clearInterval(interval.current);
      return;
    }
    interval.current = setInterval(() => {
      console.log("interval");
      const diff = target.diffNow().shiftToAll().toObject();
      setNextTime([
        clamp(diff.hours ?? 0, 0, 24),
        clamp(diff.minutes ?? 0, 0, 60),
        clamp(diff.seconds ?? 0, 0, 60),
      ]);
    }, 100);

    return () => clearInterval(interval.current);
  }, [target, celebrate]);

  if (celebrate) {
    return (
      <div className="celebration blinking">
        <p>
          Frohes Neues ihr süßen Mäuse{" "}
          <span role="img" aria-label="kissing emoji">
            😘
          </span>
        </p>
        <Fireworks
          options={{
            gravity: 1.2,
            acceleration: 1,
            brightness: { min: 70, max: 100 },
            rocketsPoint: {
              min: 0,
              max: 100,
            },
          }}
          style={{
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            position: "fixed",
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="countdown">
        <span className="number">{formatTimeElement(hours)}</span>
        <span>:</span>
        <span className="number">{formatTimeElement(minutes)}</span>
        <span>:</span>
        <span className="number">{formatTimeElement(seconds)}</span>
        <span>h</span>
      </div>
    </>
  );
};

export default function App() {
  const params = queryString.parse(location.search);

  const target =
    typeof params.target === "string"
      ? DateTime.fromISO(params.target)
      : DateTime.now().plus({ day: 1 }).startOf("day");

  return (
    <div className="app">
      <Countdown target={target} />
    </div>
  );
}
