(function($) {
    var UrlShortener = this.UrlShortener = this.UrlShortener || {};
    
    /**
     * Shorten a url using the url shortener web API
     *
     * @param   {String}    url                 The url to shorten
     * @param   {Functino}  callback            Invoked when complete
     * @param   {Object}    callback.err        An error that occurred, if any
     * @param   {Object}    callback.response   The server response, containing the short url
     */
    UrlShortener.createShortenedUrl = function(url, callback) {
        $.post('/', {'url': url})
            .done(function(data) {
                return callback(null, data.url);
            })
            .fail(function(xhr) {
                return callback(xhr.responseJSON);
            });
    };

}).call(undefined, jQuery);