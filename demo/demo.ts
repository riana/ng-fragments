/**
 * Created by riana on 11/05/15.
 */


/// <reference path='../typings/_all.ts' />
/// <reference path='../scripts/ngFragments.ts' />
/// <reference path='HeroDemoController.ts' />


module ngFragmentsDemo {

    angular.module('transitionsdemo', ['ngFragments'])
        .controller('HeroDemoController', HeroDemoController);

}