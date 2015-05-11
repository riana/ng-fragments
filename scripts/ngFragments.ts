/**
 * Created by riana on 11/05/15.
 */


    /// <reference path='../typings/_all.ts' />
    /// <reference path='HeroDirective.ts' />
    /// <reference path='HeroTransition.ts' />
    /// <reference path='SlideDirective.ts' />
    /// <reference path='SlideTransition.ts' />
    /// <reference path="FragmentContainerDirective.ts"/>


module ngFragments {

    angular.module('ngFragments', [])
        .directive('hero', HeroDirective)
        .directive('slidePush', SlideDirective)
        .directive('ngFragmentContainer', FragmentContainerDirective);

}