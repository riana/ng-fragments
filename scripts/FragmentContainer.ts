/**
 * Created by riana on 11/05/15.
 */


module ngFragments {

    export class ViewContainer {
        private currentPage:string;

        constructor(currentPage:string) {
            this.currentPage = currentPage
        }

        public getCurrentPage():string {
            return this.currentPage;
        }

        public setCurrentPage(currentPage:string) {
            this.currentPage = currentPage
        }
    }

    export var ViewContainers:{[key: string]: ViewContainer; } = {};

}