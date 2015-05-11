/**
 * Created by riana on 11/05/15.
 */

/**
 * Created by riana on 05/05/15.
 */
/// <reference path='../typings/_all.ts' />
/// <reference path='SlideTransition.ts' />

module ngFragments {
    'use strict';

    export interface SlideScope extends ng.IScope {
        //scope attributes
    }


    export function SlideDirective():ng.IDirective {

        return {
            restrict: 'A',
            link: ($scope:SlideScope, element:any, attributes:ng.IAttributes) => {
                var slideTransition:SlideTransition = new SlideTransition();
                var el = angular.element(element[0]);

                element.bind('touchstart click', function (evt) {
                    var pushPage = $scope.$eval(el.attr('slide-push'));
                    var direction = $scope.$eval(el.attr('slide-direction'));
                    var container = el.attr('slide-container');
                    slideTransition.start(pushPage, direction, container);
                });
            }
        }
    }
}