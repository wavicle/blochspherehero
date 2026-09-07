import { Animator } from "../lib3d/animator";

export const TIME_MULTIPLIER = 1e-4;
export const SOLE_ANIMATOR = new Animator({
    timeMultiplier: TIME_MULTIPLIER
});

export const BALL_OUTER_RADIUS = 30;
export const BALL_INNER_RADIUS = 20;
export const LANE_LENGTH = 500;
export const LANE_SPEED_PX_PER_COMPUTER_S = 100;

export const RESTART_DELAY_S = 5;