/* for generating contents programatically */
hotels_json = []; // will be used in result-b.js
// since we will work with the hotel's information in loadAccomodation
// thought it would be more convenient to add the code here

function loadAccomodation(){
    var name_raw, name_lst, name, addr, check_in, check_out, link;
    var temp;
    for (let [key, value] of Object.entries(hotels)){
        // setting up variables
        name_raw = value.name;
        name_lst = name_raw.split('Address: ');
        name = name_lst[0];
        name_lst.length == 2?  addr = name_lst[1]: addr = 'address unspecified';
        check_in = 'Check-in: ' + value.check_in;
        check_out = 'Check-out: ' + value.check_out;
        link = value.img_link;

        // dynamically generated content
        temp = `<article class='hotel-article row'>
                    <div class='hotel-img col-md-4' style="background-image:url('${link}');">
                    </div>
                    <div class='hotel-info col-md-8'>
                        <h5 class='hotel-name'>${name}</h5>
                        <p class='hotel-addr'>${addr}</p>
                        <p class='hotel-in'>${check_in}</p>
                        <p class='hotel-out'>${check_out}</p>
                    </div>
                </article>`;
        $('#accomodation-details').append(temp);

        // push to hotels_json
        dates = generateDates(value.check_in, value.check_out);
        for (i in dates) {
            hotel_one_day = {
                'name': name,
                'addr': addr
            };
            hotels_json.push(hotel_one_day);
        }
    }
}

// data: [Plan]
function generatePlanContent(data){
    var final_output = "";
    for (var i=0; i<data.length; i++) {
        // 1) take out all the things we need from a plan instance
        var date = data[i].date;
        var places = [data[i].place1, data[i].place2];
        if (data[i].club) {places.push(data[i].place3)};
        // needs name and addr from place objs
        var foods = [data[i].food1, data[i].food2];
        if (data[i].booze) {foods.push(data[i].food3)};
        // needs name, addr, rating and price level from food objs

        var date_html = `
            <div class='col-md-2 plan-date'>
                <h5>${date}</h5>
            </div>
        `;
        var places_and_foods_html = "";
        for (var j=0; j<2; j++){
            var price_level = ((dolla, times)=>{
                var to_return = "";
                for (var i=0;i<times;i++){ to_return += dolla; }
                return to_return;
            })("$", foods[j].price_level);

            places_and_foods_html += `
                <span class='plan-item place${j+1}'>
                    <div class='place-icon'></div>
                    <div class='place-info'>
                        <h6 class='place-name'>${places[j].name}</h6>
                        <p class='place-addr'>${places[j].addr}</p>
                    </div>
                </span>
                <span class='plan-item food${j+1}'>
                    <div class='food-icon'></div>
                    <div class='food-info'>
                        <h6 class='food-name'>${foods[j].name}</h6>
                        <p class='food-addr'>${foods[j].addr}</p>
                        <p class='food-detail'>rating: ${foods[j].rating}, ${price_level}
                    </div>
                </span>
            `;
        }
        if (data[i].club) {
            places_and_foods_html += `
                <span class='plan-item place3'>
                    <div class='club-icon'></div>
                    <div class='place-info'>
                        <h6 class='place-name'>${places[2].name}</h6>
                        <p class='place-addr'>${places[2].addr}</p>
                    </div>
                </span>
            `;
        }
        if (data[i].booze) {
            places_and_foods_html += `
                <span class='plan-item food3'>
                    <div class='booze-icon'></div>
                    <div class='place-info'>
                        <h6 class='place-name'>${foods[2].name}</h6>
                        <p class='place-addr'>${foods[2].addr}</p>
                    </div>
                </span>
            `;
        }
        places_and_foods_html = "<div class='col-md-10 the-plan>" + places_and_foods_html + "</div>";

        var one_day_html = `
            <article class='row one-day-plan'>
                ${date_html}
                ${places_and_foods_html}
            </article>
        `;

        final_output += one_day_html;
    }

    return final_output;
}


$(document).ready(function(){
    loadAccomodation();

    document.addEventListener("plan_ready", function(){
        console.log(event.detail);
        var to_load = generatePlanContent(event.detail.plans);
        $("#loading-text").replaceWith(to_load);
    });
});