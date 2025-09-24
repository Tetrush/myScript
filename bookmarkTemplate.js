javascript:
(function(){
    /*  T: Interval of the script process [msec] */
        var H ='
            var T = 500;
            var nowstatus = 0;

            setInterval("mainflow();", T);
            function mainflow(){
                var parentdoc = window.opener.document;
                var whisperbutton = parentdoc.getElementsByClassName("btn btn-xs btn-default direct-btn");
                /* Put your script here */
            }
        ';
        var openW = open();
        with (openW.document){
            write('<html><script>' + H +'</script><body>Script is running.</br>Currently <span id="nowstatus">0</span> times executed.</br></body></html>');
        }
})();