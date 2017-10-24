/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
/*******************************************************************/
// https://jsfiddle.net/upsidown/q8XS6/
(function ( $ ) {
 	
 	var triggeredLc = true;
 	var plugin = {};
	
	// open function for document trigger	
	$.fn.loadedGp = function() {
	    console.log('  ===================================');
        console.log('  + Google API callback loadedGp called');
        if( triggeredLc ) {
	    	console.log('  + loadedGp not yet triggered');
           	triggeredLc = false;
			if( plugin.$form.length > 0) {
				console.log('  + calling initGp');
           		plugin.$form.trigger("initGp");
			} else {
				console.log('  + Nothing to do form is empty');
				console.log(plugin);
			}
	    }
	    console.log('  ===================================');
	}
  	
   	$.fn.geocodeplaces = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
      		'debug'   		: false,
   			'apiKey' 		: '',
			'prefix' 		: '#CLIKEO_',
			'address' 		: 'LIB_ADR1',
			'city'    		: 'VILLE',
			'province'		: 'PROVINCE',
			'zip'     		: 'CODE_POSTAL',
			'country' 		: 'CODE_PAYS',
			'language'		: 'fr',
			'shortProvince' : false,
			'force_country' : false
        }, options );
 	
 		plugin = $(this);
 		plugin.$form = $(this).closest("form");
		var $input = $(this);
		
 		debug("== Starting jquery geocodeplaces plugin "+settings.address+' ===');
 		//debug($(this));
   		//debug(this);
   		
 	 	function debug( obj ) {
       		if (settings.debug && window.console && window.console.log ) {
	            window.console.log( obj );
        	}
    	};
 		function initializeAutocomplete(id) {
		  	debug('initializeAutocomplete('+id+')');
		  	var element = document.getElementById(id);
		  	if (element) {
				if (settings.address){
					debug('full mode');
					var gmp_options =  { types: ['geocode'] };
				} else {
					debug('zip mode');
					var gmp_options  = { types: ['(regions)'] };
				}
				debug(gmp_options);
				if (settings.force_country){
					gmp_options['componentRestrictions'] = {country : settings.force_country};
				}
			    debug(gmp_options);
				var autocomplete = new google.maps.places.Autocomplete(element,  gmp_options );
		    	google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);
		  	}
		}
		function onPlaceChanged() {
		  	var place = this.getPlace();
   
  			console.log(place);  // Uncomment this line to view the full object returned by Google API.

			if (typeof place !== "undefined" && typeof place.address_components !== "undefined"){
				sNumber = "",
				address = "",
				city = "",
				zip = "",
				province = "",
				level_1 = "",
				country = "";
				country_long_name = "";
				
				for(var i =0; i < place.address_components.length; i++) {

					var object = place.address_components[i],
						type = object.types[0];

					if( type == "street_number" ) sNumber = object.long_name;
					if( type == "route" ) address = object.long_name;
					if( type == "locality" ) city = object.long_name;
					if( type == "administrative_area_level_3" ) city = object.long_name;
					if( type == "administrative_area_level_2" ) province = object;
					if( type == "postal_code" ) zip = object.long_name;
					if( type == "administrative_area_level_1" ) level_1 = object;
					if( type == "country" ) country = object.short_name;
					if( type == "country" ) country_long_name = object.long_name;
					
				}
				/* US exception */
				province = (country=="US" || country=="FR") ? level_1 : province;
				/* long name or short name for province? */
				province = settings.shortProvince ? province.short_name : province.long_name;
				/* check error for address without street number */
				if ( sNumber === '') {
				 	$(settings.address).after('<span class="error noNumError" style="color:red;font-size:small;">Merci de saisir un numéro de rue</span>');
				 	$(settings.address).one('focus', function() {
				 		$(this).siblings('.noNumError').remove();
				 	});
				}
				
				/* fill inputs */
				$(settings.prefix+settings.address).val(sNumber+" "+address);
				$(settings.prefix+settings.city).val(city);
				$(settings.prefix+settings.province).val(province);
				$(settings.prefix+settings.zip).val(zip);
				if ($(settings.prefix+settings.country).is('select'))
					$(settings.prefix+settings.country+' option[value="'+country+'"]').prop('selected', true);
				else
					$(settings.prefix+settings.country).val(country_long_name);
				return false;
			}
		}
	
		function setup() {
			debug("== setup called");
			debug("setting autocomplete on  "+$input.attr('id'));
			google.maps.event.addDomListener(window, 'load', function() {
				initializeAutocomplete($input.attr('id'));
			});
		}

   		function init(){
	     	debug("getScript function missed.");
			if( typeof $.getScript !== "function" ) {
				debug("+ getScript function missed.");
				return;
            } else {
          	 	debug("+ getScript function exist.");
			}
	      	if( typeof google === "undefined" || typeof google.maps === "undefined" || typeof google.maps.places === "undefined" ) {
             	debug("+ Google API is not loaded");
				debug('+ https://maps.googleapis.com/maps/api/js?libraries=places&language=' + settings.language + '&callback=$.fn.loadedGp'+"&key=...");
            	$.getScript('https://maps.googleapis.com/maps/api/js?libraries=places&language=' + settings.language + '&callback=$.fn.loadedGp'+"&key="+settings.apiKey );
				debug('+ setting initGp on $form do call setup');
            	plugin.$form.one("initGp", setup );
            } else {
            	setup();
            }
   		}	
  		init();

       return this;
    };
}( jQuery ));
