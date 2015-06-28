/*
 * Standalone temperature logger
 *
 */

#include <stdio.h>
#include <time.h>
#include "pcsensor.h"
#include <curl/curl.h>

#define COLLECTION "tmps_in0"
#define ENV_URL "POST_URL"

/* Calibration adjustments */
/* See http://www.pitt-pladdy.com/blog/_20110824-191017_0100_TEMPer_under_Linux_perl_with_Cacti/ */
static float scale = 1.0287;
static float offset = -0.85;

int main(){

	// check for presence of env vars
	if (!getenv(ENV_URL)) {
		printf("Necessary environment vars not found, please set %s !\n", ENV_URL);
		return -1;
	}
	char* url;
	url = getenv(ENV_URL);

	int passes = 0;
	float tempc = 0.0000;
	do {
		usb_dev_handle* lvr_winusb = pcsensor_open();

		if (!lvr_winusb) {
			/* Open fails sometime, sleep and try again */
			sleep(3);
		} else {
			tempc = pcsensor_get_temperature(lvr_winusb);
			pcsensor_close(lvr_winusb);
		}
		++passes;
	}
	/* Read fails silently with a 0.0 return, so repeat until not zero
	   or until we have read the same zero value 3 times (just in case
	   temp is really dead on zero */
	while ((tempc > -0.0001 && tempc < 0.0001) || passes >= 4);

	if (!((tempc > -0.0001 && tempc < 0.0001) || passes >= 4)) {
		/* Apply calibrations */
		tempc = (tempc * scale) + offset;

		struct tm *utc;
		time_t t;
		t = time(NULL);
		utc = localtime(&t);

		char dt[80];
		strftime(dt, 80, "%Y-%m-%dT%H:%M:%S%z", utc);

		char json[200];

		sprintf(json, "{\"collection\":\"%s\",\"timestamp\":\"%s\",\"data\":{\"temp\":%.1f}}", COLLECTION, dt, tempc);
		printf("%s ", json);

		// init curl
		CURL *curl;
		CURLcode res;

		curl_global_init(CURL_GLOBAL_DEFAULT);

		curl = curl_easy_init();
		if(curl) {
			struct curl_slist *headers = NULL;
			headers = curl_slist_append(headers, "Accept: application/json");
			headers = curl_slist_append(headers, "Content-Type: application/json");
			headers = curl_slist_append(headers, "charsets: utf-8");
			curl_easy_setopt(curl, CURLOPT_URL, url);
			curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
			curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json);
			res = curl_easy_perform(curl);
			/* Check for errors */
			if (res != CURLE_OK) {
				fprintf(stderr, "curl_easy_perform() failed: %s\n",
				curl_easy_strerror(res));
			}

			/* always cleanup */
			curl_easy_cleanup(curl);
		}

		curl_global_cleanup();
		printf("\n");

		return 0;
	} else {
		return 1;
	}

}
