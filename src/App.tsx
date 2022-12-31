import { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon";
import { Fireworks } from "@fireworks-js/react";
import { clamp } from "lodash";

import "./styles.css";
import queryString from "query-string";
import { defaultFireworkOptions } from "./firework-options";
import { FireworksHandlers } from "fireworks-js";

const formatTimeElement = (val: number) => val.toString().padStart(2, "0");

type RemainingTime = [number, number, number, number];

type CountdownProps = {
  target: DateTime;
};

const Countdown = ({ target }: CountdownProps) => {
  const initialDiff = useRef(target.diffNow().shiftToAll().toObject()).current;
  const [[hours, minutes, seconds, milliseconds], setNextTime] =
    useState<RemainingTime>([
      initialDiff.hours ?? 0,
      initialDiff.minutes ?? 0,
      initialDiff.seconds ?? 0,
      initialDiff.milliseconds ?? 0,
    ]);
  const interval = useRef<ReturnType<typeof setInterval>>();

  const cantWait = hours <= 0 && minutes <= 0 && seconds <= 20;
  const startTheShow =
    hours <= 0 && minutes <= 0 && seconds <= 1 && milliseconds <= 400;
  const celebrate =
    hours <= 0 && minutes <= 0 && seconds <= 0 && milliseconds <= 0;
  const ref = useRef<FireworksHandlers>(null);

  useEffect(() => {
    if (celebrate) {
      clearInterval(interval.current);
      return;
    }
    interval.current = setInterval(() => {
      const diff = target.diffNow().shiftToAll().toObject();
      setNextTime([
        clamp(diff.hours ?? 0, 0, 24),
        clamp(diff.minutes ?? 0, 0, 60),
        clamp(diff.seconds ?? 0, 0, 60),
        clamp(diff.milliseconds ?? 0, 0, 1000),
      ]);
    }, 200);

    return () => clearInterval(interval.current);
  }, [target, celebrate]);

  useEffect(() => {
    if (ref.current) {
      if (cantWait) {
        ref.current.start();
      } else {
        ref.current.stop();
      }

      if (startTheShow) {
        ref.current.currentOptions.intensity = 35;
        ref.current.currentOptions.gravity = 1.5;
        ref.current.currentOptions.explosion = 8;
        ref.current.currentOptions.traceSpeed = 10;
      }
    }
  }, [ref.current, startTheShow]);

  return (
    <>
      <Fireworks
        ref={ref}
        options={defaultFireworkOptions}
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          position: "fixed",
        }}
      />
      <div className={celebrate ? "" : "hidden"}>
        <p className="celebration blinking ">
          Frohes Neues ihr süßen Mäuse{" "}
          <span role="img" aria-label="kissing emoji">
            😘
          </span>
        </p>
      </div>
      <div className={`countdown ${!celebrate ? "" : "hidden"}`}>
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
