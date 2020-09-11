/* google places api - lookup functionalities */

var POItypes = [
    'amusement_park', 
    'aquarium', 
    'art_gallery', 
    'campground',
    'casino', 
    'department_store', 
    'library', 
    'movie_theater', 
    'museum',
    'night_club', 
    'park', 
    'rv_park', 
    'shopping_mall', 
    'spa', 
    'zoo'
]; 
// special index 9: must be combined with another index to make the plan

// for avoiding repetitions of the same places in a plan
var used_ids = []; 

// other global vars we have (defined in the inline script):
// date_from (Date), date_to (Date), coordinates(json), 
// hotels(json), pois([int]), map(google.maps.Map),
// booze_check(bool), max_price(0<=int<=4)

// the plan for a single day
class Plan {
    constructor(date, idx, booze_bool){
        this.date = date; this.poiIndex = idx;
        this.club = (idx == 9); this.booze = booze_bool;
        // 2 booleans to check if the user will be drinking/clubbing
        this.place1 = 0; this.place2 = 0; this.place3 = 0;
        this.food1 = 0; this.food2 = 0; this.food3 = 0;
        // if clubbing is in the plan, automatically set this.poiIndex to 15
        if (this.club) {this.poiIndex == 15;}
    }

    // obj: a cleaned google place api query result
    // returns a string indicating success/failure
    static addPlace(ins, obj){
        if (ins.place1 == 0) {
            ins.place1 = obj; return `${ins.date}: place1 added`;
        } else if (ins.place2 == 0) {
            ins.place2 = obj; return `${ins.date}: place2 added`;
        } else if (ins.club && ins.place3 == 0) {
            // check if the place is actually a club
            if (obj.types.indexOf('night_club') != -1) {
                ins.place3 = obj; return `${ins.date}: place3 added`;
            } else {
                return `${ins.date}: not a club so can't add place3`;
            }
        } else if (ins.club == false) {
            return `${ins.date}: can't add place3`;
        } else {
            return `${ins.date}: instance places are all added`;
        }
    }
    static addFood(ins, obj){
        if (ins.food1 == 0) {
            ins.food1 = obj; return `${ins.date}: food1 added`;
        } else if (ins.food2 == 0) {
            ins.food2 = obj; return `${ins.date}: food2 added`;
        } else if (ins.booze && ins.food3 == 0) {
            ins.food3 = obj; return `${ins.date}: food3 added`;
        } else if (ins.booze == false) {
            return `${ins.date}: can't add food3`;
        } else {
            return `${ins.date}: instance foods are all added`;
        }
    }
    
    // obj: a cleaned google place api query result
    // which: 1, 2, or 3
    // returns a string indicating success/failure
    static editPlace(ins, obj, which){
        switch(which){
            case 1: 
                ins.place1 = obj; return `${ins.date}: place1 changed`; break;
            case 2:
                ins.place2 = obj; return `${ins.date}: place2 changed`; break;
            case 3:
                if (ins.club) {
                    ins.place3 = obj; return `${ins.date}: place3 changed`; break;
                } else {
                    return `${ins.date}: can't change place3`; break;
                }
            default:
                return `${ins.date}: wrong param which`;
        }
    }
    static editFood(ins, obj, which){
        switch(which){
            case 1: 
                ins.food1 = obj; return `${ins.date}: food1 changed`; break;
            case 2:
                ins.food2 = obj; return `${ins.date}: food2 changed`; break;
            case 3:
                if (ins.booze) {
                    ins.food3 = obj; return `${ins.date}: food3 changed`; break;
                } else {
                    return `${ins.date}: can't change food3`; break;
                }
            default:
                return `${ins.date}: wrong param which`;
        }
    }

    // for debugging
    static log(ins){
        console.log(`${ins.date}, type=${ins.poiIndex}, club=${ins.club}, booze=${ins.booze}:`);
        console.log(ins.place1, ins.place2, ins.place3, ins.food1, ins.food2, ins.food3);
    }

    // returns bool;
    // check if the instance's *places* are all filled out
    static check(ins){
        var mandatory = ins.place1==0 || ins.place2==0;
        // is true if any one of the fields are empty
        if (mandatory) {
            return false;
        } else {
            if (ins.club) {
                if (ins.place3 == 0){return false;}
            }
            return true;
        }
    }
}

// ('yyyy-mm-dd', 'yyyy-mm-dd') => ['yyyy-mm-dd' ...]
// generates all strings representing dates between start and end,
// from the earliest to the latest
// e.g. ['2020-08-02', '2020-08-03', ...]
function generateDates(start, end){
    let startDate = new Date(start);
    let endDate = new Date(end);
    let output = [];
    while (startDate < endDate){
        output = [...output, startDate.toISOString().substring(0, 10)];
        startDate.setDate(startDate.getDate() + 1);
    }
    return output;
}

// computation things
function shuffle(array){
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
function random(n){
    return Math.floor(Math.random()*n);
}

// ======================================================
// ======================================================
$(document).ready(function(){

    let process = new Promise((resolve, reject) => {
        // step 1: generate a list of Plan instances
        // [dependencies] class Plan, generateDates, shuffule, random
        let output = [];
        let all_dates = generateDates(date_from, date_to);
        while (pois.length != all_dates.length){
            pois.push(15); // if there are less themes than days, fill the rest of the days with generic plans
        }
        shuffle(pois);
        for (var i = 0; i < pois.length; i++){
            output.push(new Plan(all_dates[i], pois[i], booze_check));
        }
        resolve(output);
    });  
    process.then((output)=>{

        // step 2: do a general query first
        // if the query is successful, will resolve to a list of json objects
        // containing info about the places of interests
        var request = {
            location: coordinates, 
            radius: '20000',
            type: ['tourist_attraction'],
        };
        let service = new google.maps.places.PlacesService(map);
        // this promise will resolve once the places api query has received and processed data
        return new Promise((resolve, reject) => {
            var data = [];
            service.nearbySearch(request, function(results, status, pagination){
                // callback function used by nearbySearch, just for cleaning the data
                if (status == google.maps.places.PlacesServiceStatus.OK){   
                    // get cleaned data first
                    for (var i = 0; i < results.length; i++) {
                        var coords = results[i].geometry.location;
                        coords = {lat: coords.lat(), lng: coords.lng()};
                        var entry = {
                            name: results[i].name,
                            place_id: results[i].place_id,
                            types: results[i].types,
                            addr: results[i].vicinity,
                            coordinates: coords
                        };
                        data.push(entry);
                    }
                    if (pagination.hasNextPage) {
                        // get all 60 results; this callback is used again by nextPage()
                        pagination.nextPage();
                    } else {
                        // resolve the promise if we have reached the last result
                        resolve({
                            Plans: output,
                            data: data
                        });
                    }
                    // carry the list of instances further down the promise chain;
                    // it's not used in step 2 but will be in later steps
                }else{
                    var msg = `general query failed: ${status}`;
                    reject(new Error(msg));
                }
            })
        });
    }).then((result) => {

        // step 3: the general query should be finished
        // iterate through the data query; if an item matches the poi type,
        // add it to that day's Plan instance
        // also have a backup_stack for filling in generic days' plans
        // --------------------------
        // result is of the following format: 
        // {Plans: [Plan], data: [{...}]}
        // --------------------------------------
        var backup_stack = [];
        var Plans = result.Plans;
        var data = result.data;
        for (var i = 0; i < data.length; i++){
            // i-loop goes through all entries
            var types = data[i].types;
            var idx_of_plan = -1;
            for (var j = 0; j < types.length; j++){
                // j-loop goes through all types in an entry
                var temp = POItypes.indexOf(types[j]);
                if (temp != -1 && temp != 15){
                    // this entry matches with one of the 15 types in the global var POItypes
                    idx_of_plan = pois.indexOf(temp);
                    if (idx_of_plan != -1){
                        // this entry is not only one of the 15, but also one from the categories that the user selected
                        // then use this data item to fill that day's plan
                        Plan.addPlace(Plans[idx_of_plan], data[i]);
                        // keep track of place ids (to check for repetition later)
                        used_ids.push(data[i].place_id);
                        break;
                    }
                }
            }
            if (idx_of_plan == -1 || idx_of_plan == 15){
                // after iterating through all the types still cannot find a matching one --
                // this entry doesn't fit into any of the days
                backup_stack.push(data[i]);
            }
        }
        // end of i-loop, finished going through all given entries
        
        // [int], indices of specific types that need to be further queried
        var additional_queries = [];

        // this loop does two things before making any new queries
        for (var i = 0; i < pois.length; i++){
            // 1. fill days for generic tourist spots first
            if (pois[i] == 15 || pois[i] == 9){
                while (Plan.check(Plans[i]) == false) {
                    if (backup_stack.length != 0 ) {
                        var message = Plan.addPlace(Plans[i], backup_stack.pop());
                        // if the poi type is a night club we will be stuck inside the while loop;
                        // the code below gives a way out
                        if (message.includes('not a club')){ break; }
                    } else {
                        break;
                    }
                }
            }
            // 2. find what needs to be further queried
            if (pois[i] != 15 && Plan.check(Plans[i]) == false){
                if (additional_queries.indexOf(pois[i]) == -1) {
                    additional_queries.push(pois[i]);
                }
            }
        }
        // --------------------------------------
        return {
            Plans: Plans,
            backup_stack: backup_stack, 
            additional_queries: additional_queries
        };
    }).then((result) => {

        // step 4: make more places api calls based on additional_queries
        // (delete this later - this was where my sanity started breaking down)
        // a) unpack anything we need from result (just for syntaxic simplicity)
        var additional_queries = result.additional_queries;

        // b) making the search request
        var service = new google.maps.places.PlacesService(map);
        // this promise will resolve to json of the following format: 
        /*
        {Plans: [Plan], backup_stack: [{...}],
        all_data: [Promise] => [{type: str, data: [{...}]}]
        }
        */
        var all_types = additional_queries.map(x => POItypes[x]);
            
        // creating new promise here since the lookup takes time to complete
        var all_data = all_types.map((the_type) => {
            // in the map function, a promise will be returned to each element in all_data
            // (takes a few seconds to resolve)
            var request = {
                location: coordinates,
                radius: '30000',
                types: [the_type]
            };
            var data = new Promise((resolve, reject) => {
                service.nearbySearch(request, function(results, status){
                    // callback function for requests
                    if (status == google.maps.places.PlacesServiceStatus.OK){
                        var temp_data = [];
                        // get cleaned data first
                        for (var j = 0; j < results.length; j++) {
                            var coords = results[j].geometry.location;
                            coords = {lat: coords.lat(), lng: coords.lng()};
                            var entry = {
                                name: results[j].name,
                                place_id: results[j].place_id,
                                types: results[j].types,
                                addr: results[j].vicinity,
                                coordinates: coords
                            };
                            temp_data.push(entry);
                        }
                        resolve({type: the_type, data: temp_data});
                    }else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
                        // if there are no results just push an empty array;
                        // will handle this in later steps
                        resolve({type: the_type, data: []});
                    }else{
                        var msg = `Status error at specific type ${current_type}: ${status}`
                        reject(new Error(msg));
                    }
                });
            });
            return data;
        });

        return new Promise((resolve, reject) => {
            resolve({
                Plans: result.Plans,
                backup_stack: result.backup_stack,
                all_data: all_data
            })
        })
    }).then((result) => {

        // step 5: given the backup_stack and the new all_data,
        // continue filling the plan
        // a) unpack everything we need from result (for syntaxic simplicity)
        var Plans = result.Plans;
        var backup_stack = result.backup_stack;
        var all_data = result.all_data;

        // b) add the new query results to the plans
        for (var i = 0; i < all_data.length; i++){
            // go through each type of data
            var new_Plans = all_data[i].then((the_data) => {
                // always identify which day the poi type is matched to
                var idx_of_target = pois.indexOf(POItypes.indexOf(the_data.type));

                if (the_data.data.length != 0) {
                    for (var j = 0; j < the_data.data.length; j++) {
                        // iterates through each entry in data of a specific type 
                        var this_entry = the_data.data[j];
                        if (used_ids.indexOf(this_entry.place_id) == -1) {
                            // this entry is not used yet and can be added
                            if (Plan.check(Plans[idx_of_target]) == false) {
                                Plan.addPlace(Plans[idx_of_target], this_entry);
                                used_ids.push(this_entry.place_id);
                            } else {
                                backup_stack.push(this_entry);
                            }
                            
                        }
                    }
                } else {
                    // when there are no pois of such type, pop a thing from the backup stack
                    for (var i = 0; i < 2; i++) {
                        if (Plan.check(Plans[idx_of_target]) == false){
                            var to_add = backup_stack.pop();
                            if (typeof to_add === undefined){
                                // will have to think about the error handling here
                                console.log("backup stack is empty and can't be used :|");
                            } else {
                                Plan.addPlace(Plans[idx_of_target], to_add);
                            }
                        }
                    }
                }

                return Plans; // iteratively update the data in new_Plans
                // new_Plans, when fulfilled, will ahve the same format as Plans
            });
        }

        // d) check if the plans are finished & resolve this promise in the chain
        for (var i in new_Plans) {
            if (Plan.check(new_Plans[i]) == false) {
                return {
                    Plans: new_Plans,
                    backup_stack: backup_stack,
                    places_full: false
                };
            }
        }
        return {
            Plans: new_Plans, // a promise of [Plan]
            places_full: true
        };
        
    }).then((result) => {

        // step 6: usually at this stage the plan is all filled;
        // query for restaurants

        var request = {
            keyword: `restaurants in ${city}`,
            location: coordinates,
            maxPriceLevel: max_price,
            radius: '10000',
        };
        let service = new google.maps.places.PlacesService(map);

        return new Promise ((resolve, reject) => {
            var data = [];
            var unplanned_days_left = pois.length;
            service.nearbySearch(request, function(results, status, pagination){
                // callback function used by nearbySearch, just for cleaning the data
                if (status == google.maps.places.PlacesServiceStatus.OK){
                    // get cleaned data first
                    for (var i = 0; i < results.length; i++){
                        var coords = results[i].geometry.location;
                        coords = {lat: coords.lat(), lng: coords.lng()};
                        var entry = {
                            name: results[i].name,
                            place_id: results[i].place_id,
                            types: results[i].types,
                            addr: results[i].vicinity,
                            rating: results[i].rating,
                            rating_count: results[i].user_ratings_total,
                            price_level: results[i].price_level,
                            coordinates: coords
                        };
                        data.push(entry);
                        if (unplanned_days_left > 0) {unplanned_days_left -= 0.5;}
                    }
                    // if all days are planned then there's no need to go for the next two pages
                    if (unplanned_days_left > 0) {
                        if (pagination.hasNextPage) {
                            pagination.nextPage();
                        } else {
                            console.log('has no more pages :/')
                            // in this case, we don't have enough restaurants to fill the whole plan
                            resolve({
                                Plans: result.Plans,
                                places_full: result.places_full,
                                data: data,
                                food_full: false
                            });
                        }
                    } else {
                        resolve({
                            Plans: result.Plans,
                            places_full: result.places_full, 
                            data: data,
                            food_full: true
                        });
                    }
                } else {
                    var msg = `Querying food places failed: ${status}`;
                    throw new Error(msg);
                }
            })
        })
    }).then((result) => {

        // step 6b: if user chooses to drink, also query for bars

        if (booze_check) {

            var request = {
                location: coordinates,
                keyword: `bars in ${city}`,
                radius: '10000',
                maxPriceLevel: max_price
            };
            let service = new google.maps.places.PlacesService(map);

            return new Promise((resolve, reject) => {
                var booze_data = [];
                var needed_bars_count = pois.length;
                service.nearbySearch(request, function(results, status, pagination){
                    // callback function used by nearbySearch, just for cleaning the data
                    if (status == google.maps.places.PlacesServiceStatus.OK){
                        // get cleaned data first
                        for (var i = 0; i < results.length; i++){
                            var coords = results[i].geometry.location;
                            coords = {lat: coords.lat(), lng: coords.lng()};
                            //console.log(results[i]);
                            var entry = {
                                name: results[i].name,
                                place_id: results[i].place_id,
                                types: results[i].types,
                                addr: results[i].vicinity,
                                rating: results[i].rating,
                                rating_count: results[i].user_ratings_total,
                                price_level: results[i].price_level,
                                coordinates: coords
                            };
                            booze_data.push(entry);
                            if (needed_bars_count > 0) {needed_bars_count -= 1;}
                        }
                        
                        if (needed_bars_count > 0) {
                            if (pagination.hasNextPage) {
                                pagination.nextPage();
                            } else {
                                console.log('has no more pages :/')
                                // in this case, we don't have enough bars to fill the whole plan
                                resolve({
                                    Plans: result.Plans,
                                    places_full: result.places_full,
                                    food_data: result.data,
                                    food_full: result.food_full,
                                    booze_data: booze_data,
                                    booze_full: false
                                });
                            }
                        } else {
                            resolve({
                                Plans: result.Plans,
                                places_full: result.places_full, 
                                food_data: result.data,
                                food_full: result.food_full,
                                booze_data: booze_data,
                                booze_full: true
                            });
                        }
                    } else {
                        var msg = `Querying booze places failed: ${status}`;
                        reject(new Error(msg));
                    }
                });
            });
        } else {
            return result;
        }
    }).then((result)=>{

        // step 7: put the restaurants and bars into the plan

        // a) unpack everything we need (syntaxical simplicity)
        var Plans = result.Plans;
        var food_data = result.food_data;
        if (booze_check) {var booze_data = result.booze_data;}


        var new_Plans = Plans.then((Plans) => {
            // b) load the restaurants into Plans
            for (var i in Plans) {
                for (var j=0; j < 2; j++) {
                    var to_add = food_data.pop();
                    if (to_add != undefined) {
                        Plan.addFood(Plans[i], to_add);
                    } else {
                        Plan.addFood(Plans[i], {name: "Explore the region all you want", address: "", custom: true});
                    }
                }
            }

            // c) load the bars if drinking
            if (booze_check) {
                Plans.map((ins)=>{
                   Plan.addFood(ins, booze_data.pop());
                });
            }

            return Plans;
        });

        return new_Plans;
    }).then((result) => {
        console.log(`received result:`, result);
        for (i in result) {
            result[i].hotel = hotels_json[i];
        }
        console.log(result);
        var event = new CustomEvent("plan_ready", {
            detail: {
                'city': city,
                'plans': result
            }
        });
        document.dispatchEvent(event);
    })

});// closing bracket for document.ready