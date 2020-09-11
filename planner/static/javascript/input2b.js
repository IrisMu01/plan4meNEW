/* for gathering google places data */

$(document).ready(function(){
    // request data of nearby hotels
    var hotel_request = {
        location: coordinates,
        radius: '5000',
        type: ['lodging']
    };
    hotel_service = new google.maps.places.PlacesService(map);
    hotel_service.nearbySearch(hotel_request, hotel_callback);

    // event listener for clicking on the marker
    function attachHotelInfo(marker, data){
        var contentDOM = `<div class='hotel-info-window'><h6>${data.name}</h6>`+
        `<p class='hotel-info-addr'>${data.address}</p><img class='info-window-img' src=${data.img_link}><p class='hotel-info-rating'>${data.rating_count} ratings with an average of ${data.rating}</p>`+
        `<button type='button' class='add-this-hotel btn btn-success'>Add this to my list</button></div>`;
        var infowindow = new google.maps.InfoWindow({
            content: contentDOM,
            maxWidth: 200
        })
        marker.addListener('click', function(){
            infowindow.open(marker.get('map'), marker)
        })
    }

    function hotel_callback(results, status, pagination){
        if (status == google.maps.places.PlacesServiceStatus.OK){
            // if data successfully requested, put markers on the map
            for (var i = 0; i < results.length; i++){
                var coords = results[i].geometry.location;
                coords = {lat: coords.lat(), lng: coords.lng()};
                var data = {
                    name: results[i].name,
                    address: results[i].vicinity,
                    rating: results[i].rating,
                    rating_count: results[i].user_ratings_total,
                    img_link: (results[i].photos === undefined) ? '': results[i].photos[0].getUrl()
                }
                var marker = new google.maps.Marker({
                    position: coords,
                    map: map
                });
                attachHotelInfo(marker, data);
            }
            if (pagination.hasNextPage) {
                pagination.nextPage();
            }
        }
    }
})