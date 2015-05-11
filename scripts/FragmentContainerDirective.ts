/**
 * Created by riana on 11/05/15.
 */

/// <reference path='../typings/_all.ts' />
/// <reference path='HeroTransition.ts' />

module ngFragments {
    'use strict';

    export interface FragmentContainerScope extends ng.IScope {
        //scope attributes
    }


    export function FragmentContainerDirective():ng.IDirective {

        return {
            restrict: 'EA',
            link: ($scope:FragmentContainerScope, element:any, attributes:ng.IAttributes) => {
                var el = angular.element(element[0]);
                var container:ViewContainer = new ViewContainer(el.attr('default-view'));
                ViewContainers[el.attr('id')] = container;

                var defaultViewElement = angular.element(document.getElementById(el.attr('default-view')));
                defaultViewElement.addClass('transition-slide-active');
            }
        }
    }
}