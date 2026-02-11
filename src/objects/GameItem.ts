import { IContractualClass } from '@core/interfaces';
import { DataItemBase } from '../data/DataItemBase.ts';
import { $dataArmors, $dataWeapons, $dataItems, $dataSkills, DataManager } from '@managers';
import { DataItem } from '@data/DataItem.ts';
import { DataWeapon } from '@data/DataWeapon.ts';
import { DataArmor } from '@data/DataArmor.ts';
import { DataSkill } from '@data/DataSkill.ts';



type DataClass = "skill" | "item" | "weapon" | "armor" | "";
type ItemType =  DataSkill | DataItem | DataWeapon | DataArmor | null;

/**
 * The game object class for handling skills, items, weapons, and armor. It is
 * required because save data should not include the database object itself.
 */
export class GameItem implements  IContractualClass {

  protected _dataClass: DataClass;
  protected _itemId: number;

  constructor(item: ItemType);
  constructor(...args: any[]){
    this.initialize(...args);
  }

  /**
   * Initialize the GameItem object.
   * @param item The item object to initialize the GameItem with.
   * @param args extra arguments for plugins developers
   * @constructor
   */
  initialize( item?: ItemType,...args: any[]): void {
    if(item){
      this.setObject(item);
    }
  }

  /**
   * Return whether the item is a skill or not.
   * @returns {boolean} True if the item is a skill, false otherwise.
   */
  isSkill(): boolean {
    return this._dataClass === "skill";
  }

  /**
   * Return whether the item is an item or not.
   * @returns {boolean} True if the item is an item, false otherwise.
   */
  isItem(): boolean {
    return this._dataClass === "item";
  }

  /**
   * Return whether the item is usable or not.
   * @returns {boolean} True if the item is usable, false otherwise.
   */
  isUsableItem(): boolean {
    return this.isSkill() || this.isItem();
  }

  /**
   * Return whether the item is a weapon or not.
   * @returns {boolean} True if the item is a weapon, false otherwise.
   */
  isWeapon(): boolean {
    return this._dataClass === "armor";
  }

  /**
   * Return whether the item is an armor or not.
   * @returns {boolean} True if the item is an armor, false otherwise.
   */
  isArmor(): boolean {
    return this._dataClass === "armor";
  }

  /**
   * Return whether the item is an equipable item or not.
   * @returns {boolean} True if the item is an equip item, false otherwise.
   */
  isEquipItem(): boolean {
    return this.isWeapon() || this.isArmor();
  }

  /**
  * Return whether the item is null or not.
  * @returns {boolean} True if the item is null, false otherwise.
  */
  isNull(): boolean {
    return this._dataClass === "";
  }

  /**
   * return the item id
   * @returns {number} the item id
   */
  itemId(): number {
    return this._itemId;
  }

  /**
   * Return the item object
   * @returns {ItemType} the item object
   */
  object(): ItemType {
    if(this.isSkill()) return $dataSkills[this._itemId];
    else if(this.isItem()) return $dataItems[this._itemId];
    else if (this.isWeapon()) return $dataWeapons[this._itemId];
    else if (this.isArmor()) return $dataArmors[this._itemId];
    else return null;
  }

  /**
   * Set the item object.
   * @param item The item object to set the GameItem with.
   */
  setObject(item: ItemType){
    const data = DataManager;
    if(data.isSkill(item)) this._dataClass = "skill";
    else if(data.isItem(item)) this._dataClass = "item";
    else if(data.isWeapon(item)) this._dataClass = "weapon";
    else if(data.isArmor(item)) this._dataClass = "armor";
    else this._dataClass = "";
    this._itemId = item ? item.id : 0;
  }

  /**
   * Set the item object as an equipable item.
   * @param isWeapon Whether the item is a weapon or armor.
   * @param itemId The ID of the equipable item.
   */
  setEquip(isWeapon: boolean, itemId: number){
    this._dataClass = isWeapon ? "weapon" : "armor";
    this._itemId = itemId;
  }
}
