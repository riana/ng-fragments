/**
 * Created by riana on 26/04/15.
 */


/// <reference path='../typings/_all.ts' />

module ngFragmentsDemo {

    'use strict';

    export interface HeroDemoScope extends ng.IScope {
        ctrl : HeroDemoController;
    }

    export class HeroDemoController {

        public static $inject = [
            '$scope'
        ];

        public selectedItem:string;

        public items:any[] =[];

        constructor(private $scope:HeroDemoScope) {
            $scope.ctrl = this;
            for(var i = 0; i < 20; i++){
                var item = {
                    id: i,
                    label: 'User #' + i
                }
                this.items.push(item);
            }

        }

        public selectItem(item:string) {
            this.selectedItem = item;
        }

    }

}