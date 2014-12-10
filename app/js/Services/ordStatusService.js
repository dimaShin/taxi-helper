/**
 * Created by iashind on 03.12.14.
 */
'use strict';
define(['app'], function(app){

    function statusService(){
        var status = [
            'в очереди',
            'принят',
            'ожидает',
            'в пути',
            'выполнен'
        ];
        return {
            getStatus: function(id){
                return status[id];
            }
        }
    }

    app.factory('ordStatusService', statusService);
});