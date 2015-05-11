/**
 * Created by riana on 11/05/15.
 */


    /// <reference path='../typings/_all.ts' />
    /// <reference path="FragmentContainer.ts"/>

module ngFragments {

    export class SlideTransition {


        public start(pushPage, direction, container) {
            var pushDom = document.getElementById(pushPage);
            var pushElement = angular.element(pushDom);
            var parent = pushElement.parent();

            var viewContainer:ViewContainer = ViewContainers[parent.attr('id')];
            var currentId = viewContainer.getCurrentPage();
            var currentElement = angular.element(document.getElementById(currentId));
            viewContainer.setCurrentPage(pushPage);

            if(direction === 'left') {
                currentElement.addClass('transition-slide-left');
                pushElement.addClass('transition-slide-active');
                currentElement.removeClass('transition-slide-active');
            }else if(direction === 'right') {
                currentElement.addClass('transition-slide-right');
                pushElement.addClass('transition-slide-active');
                currentElement.removeClass('transition-slide-active');
            }
        }
    }

}