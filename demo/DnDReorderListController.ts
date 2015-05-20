/**
 * Created by riana on 20/05/15.
 */

/// <reference path='../typings/_all.ts' />

module ngFragmentsDemo {

    'use strict';

    export interface DnDReorderListScope extends ng.IScope {
        ctrl : DnDReorderListController;
    }

    export class DnDReorderListController {

        public static $inject = [
            '$scope'
        ];

        myItems:any[] = [];

        constructor(private $scope:DnDReorderListScope) {
            $scope.ctrl = this;

            for(var i = 0; i < 5; i++){
                var item = {
                    label: 'Item #' + i
                };
                this.myItems.push(item);
            }

        }

    }

}