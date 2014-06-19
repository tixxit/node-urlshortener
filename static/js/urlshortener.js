(function($) {
    var UrlShortener = this.UrlShortener = this.UrlShortener || {};
    
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