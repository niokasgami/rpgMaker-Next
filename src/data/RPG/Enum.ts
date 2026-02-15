

export enum EventTrigger {

}
export enum CommonEventTrigger {
  NONE = 0,
  AUTORUN = 1,
  PARALLEL = 2,
}

export enum OccasionType {
  ALWAYS = 0,
  BATTLE_SCREEN = 1,
  MENU_SCREEN = 2,
  NEVER = 3
}


export enum HitType {
  CERTAIN = 0,
  PHYSICAL = 1,
  MAGICAL = 2
}
/**
 * the Scope of item and skills.
 */
export enum ScopeType {
  NONE = 0,
  ONE_ENEMY = 1,
  ALL_ENEMIES = 2,
  ONE_RANDOM_ENEMY = 3,
  TWO_RANDOM_ENEMIES = 4,
  THREE_RANDOM_ENEMIES = 5,
  FOUR_RANDOM_ENEMIES = 6,
  ONE_ALIVE_ALLY = 7,
  ALL_ALLIES_ALIVE = 8,
  ONE_DEAD_ALLY = 9,
  ALL_ALLIES_DEAD = 10,
  USER = 11,
  ONE_ALLY_UNCONDITIONAL  = 12,
  ALL_ALLIES_UNCONDITIONAL = 13,
  ENEMIES_AND_ALLIES = 14
}
