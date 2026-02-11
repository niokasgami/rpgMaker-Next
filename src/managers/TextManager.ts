import { $dataSystem } from '@managers/DataManager.ts';


export class TextManager {


  /**
   * the basic terms
   * @param basicId
   */
  static basic(basicId: number): string {
    return $dataSystem.terms.basic[basicId] || "";
  }

  /**
   * the param terms
   * @param paramId
   */
  static param(paramId: number) {
    return $dataSystem.terms.params[paramId] || "";
  }

  /**
   * the command terms
   * @param commandId
   */
  static command(commandId: number): string {
    return $dataSystem.terms.commands[commandId] || "";
  }

  /**
   * the message term
   * @param messageId
   */
  static message(messageId: string): string {
    //@ts-ignore
    return $dataSystem.terms.messages[messageId]  || "";
  }

  /**
   * the function that allows to get the getter
   * @param method
   * @param param
   */
  static getter(method: string, param: number | string): string {
    return (this[method as keyof typeof this] as (param: number | string) => string)(param);
  }

  get currencyUnit(): string {
    return $dataSystem.currencyUnit;
  }

  // Basic terms
  static get level() { return this.getter("basic", 0); }
  static get levelA() { return this.getter("basic", 1); }
  static get hp() { return this.getter("basic", 2); }
  static get hpA() { return this.getter("basic", 3); }
  static get mp() { return this.getter("basic", 4); }
  static get mpA() { return this.getter("basic", 5); }
  static get tp() { return this.getter("basic", 6); }
  static get tpA() { return this.getter("basic", 7); }
  static get exp() { return this.getter("basic", 8); }
  static get expA() { return this.getter("basic", 9); }

  // Command terms
  static get fight() { return this.getter("command", 0); }
  static get escape() { return this.getter("command", 1); }
  static get attack() { return this.getter("command", 2); }
  static get guard() { return this.getter("command", 3); }
  static get item() { return this.getter("command", 4); }
  static get skill() { return this.getter("command", 5); }
  static get equip() { return this.getter("command", 6); }
  static get status() { return this.getter("command", 7); }
  static get formation() { return this.getter("command", 8); }
  static get save() { return this.getter("command", 9); }
  static get gameEnd() { return this.getter("command", 10); }
  static get options() { return this.getter("command", 11); }
  static get weapon() { return this.getter("command", 12); }
  static get armor() { return this.getter("command", 13); }
  static get keyItem() { return this.getter("command", 14); }
  static get equip2() { return this.getter("command", 15); }
  static get optimize() { return this.getter("command", 16); }
  static get clear() { return this.getter("command", 17); }
  static get newGame() { return this.getter("command", 18); }
  static get continue_() { return this.getter("command", 19); }
  static get toTitle() { return this.getter("command", 21); }
  static get cancel() { return this.getter("command", 22); }
  static get buy() { return this.getter("command", 24); }
  static get sell() { return this.getter("command", 25); }

  // Message terms
  static get alwaysDash() { return this.getter("message", "alwaysDash"); }
  static get commandRemember() { return this.getter("message", "commandRemember"); }
  static get touchUI() { return this.getter("message", "touchUI"); }
  static get bgmVolume() { return this.getter("message", "bgmVolume"); }
  static get bgsVolume() { return this.getter("message", "bgsVolume"); }
  static get meVolume() { return this.getter("message", "meVolume"); }
  static get seVolume() { return this.getter("message", "seVolume"); }
  static get possession() { return this.getter("message", "possession"); }
  static get expTotal() { return this.getter("message", "expTotal"); }
  static get expNext() { return this.getter("message", "expNext"); }
  static get saveMessage() { return this.getter("message", "saveMessage"); }
  static get loadMessage() { return this.getter("message", "loadMessage"); }
  static get file() { return this.getter("message", "file"); }
  static get autosave() { return this.getter("message", "autosave"); }
  static get partyName() { return this.getter("message", "partyName"); }
  static get emerge() { return this.getter("message", "emerge"); }
  static get preemptive() { return this.getter("message", "preemptive"); }
  static get surprise() { return this.getter("message", "surprise"); }
  static get escapeStart() { return this.getter("message", "escapeStart"); }
  static get escapeFailure() { return this.getter("message", "escapeFailure"); }
  static get victory() { return this.getter("message", "victory"); }
  static get defeat() { return this.getter("message", "defeat"); }
  static get obtainExp() { return this.getter("message", "obtainExp"); }
  static get obtainGold() { return this.getter("message", "obtainGold"); }
  static get obtainItem() { return this.getter("message", "obtainItem"); }
  static get levelUp() { return this.getter("message", "levelUp"); }
  static get obtainSkill() { return this.getter("message", "obtainSkill"); }
  static get useItem() { return this.getter("message", "useItem"); }
  static get criticalToEnemy() { return this.getter("message", "criticalToEnemy"); }
  static get criticalToActor() { return this.getter("message", "criticalToActor"); }
  static get actorDamage() { return this.getter("message", "actorDamage"); }
  static get actorRecovery() { return this.getter("message", "actorRecovery"); }
  static get actorGain() { return this.getter("message", "actorGain"); }
  static get actorLoss() { return this.getter("message", "actorLoss"); }
  static get actorDrain() { return this.getter("message", "actorDrain"); }
  static get actorNoDamage() { return this.getter("message", "actorNoDamage"); }
  static get actorNoHit() { return this.getter("message", "actorNoHit"); }
  static get enemyDamage() { return this.getter("message", "enemyDamage"); }
  static get enemyRecovery() { return this.getter("message", "enemyRecovery"); }
  static get enemyGain() { return this.getter("message", "enemyGain"); }
  static get enemyLoss() { return this.getter("message", "enemyLoss"); }
  static get enemyDrain() { return this.getter("message", "enemyDrain"); }
  static get enemyNoDamage() { return this.getter("message", "enemyNoDamage"); }
  static get enemyNoHit() { return this.getter("message", "enemyNoHit"); }
  static get evasion() { return this.getter("message", "evasion"); }
  static get magicEvasion() { return this.getter("message", "magicEvasion"); }
  static get magicReflection() { return this.getter("message", "magicReflection"); }
  static get counterAttack() { return this.getter("message", "counterAttack"); }
  static get substitute() { return this.getter("message", "substitute"); }
  static get buffAdd() { return this.getter("message", "buffAdd"); }
  static get debuffAdd() { return this.getter("message", "debuffAdd"); }
  static get buffRemove() { return this.getter("message", "buffRemove"); }
  static get actionFailure() { return this.getter("message", "actionFailure"); }
}
