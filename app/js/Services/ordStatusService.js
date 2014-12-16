/**
 * Created by iashind on 03.12.14.
 */
'use strict';

/**
 * @module statusService
 */
define(['app'], function(app){
    /**
     * @function statusService
     * holds text value of status
     * @returns {{getStatus: Function}}
     */
    function statusService(){
        var status = [
            'в очереди',
            'принят',
            'ожидает',
            'в пути',
            'выполнен'
        ];
        return {
            /**
             * @function getStatus
             * convert int value of status into text
             * @param id
             * @returns {string}
             */
            getStatus: function(id){
                return status[id];
            }
        }
    }

    app.factory('ordStatusService', statusService);
});