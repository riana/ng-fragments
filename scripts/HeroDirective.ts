/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='HeroTransition.ts' />

module ngFragments {
    'use strict';

    export interface HeroScope extends ng.IScope {
        //scope attributes
    }


    export function HeroDirective():ng.IDirective {

        return {
            restrict: 'A',
            link: ($scope:HeroScope, element:any, attributes:ng.IAttributes) => {
                var heroTransition:HeroTransition = new HeroTransition();
                var el = angular.element(element[0]);
                element.bind('touchstart click', function (evt) {
                    var source = $scope.$eval(el.attr('hero-source'));
                    var dest = $scope.$eval(el.attr('hero-push'));
                    var container = el.attr('hero-container');
                    heroTransition.start(source, dest, container);
                });
            }
        }
    }
}