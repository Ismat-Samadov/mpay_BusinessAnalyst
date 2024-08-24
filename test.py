import requests

# Define the URL
url = "https://px.ads.linkedin.com/wa/"

# Define the headers
headers = {
    "accept": "*/*",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,ru;q=0.7,az;q=0.6",
    "content-type": "text/plain;charset=UTF-8",
    "cookie": ('li_sugr=ce54bd54-97b2-42df-bb22-3ddb7cabb72f; bcookie="v=2&cfd47d84-10ce-4ceb-8260-a5463648df99"; _guid=341b936e-bf33-414d-b70c-017237bfbac7; ar_debug=1; lang=v=2&lang=en-us; liap=true; at_check=true; mbox=session#201e3d7348f2443c874092747734af02#1723698445|PC#201e3d7348f2443c874092747734af02.37_0#1739248585; sdsc=22%3A1%2C1724442024499%7EJAPP%2C01SI1HXLTdJPQnTKWR07QjpxIL6E%3D; AnalyticsSyncHistory=AQLnBWca91IusQAAAZGD5BOesMgtrrLkzPR5_CAIHB2TGrfzUlVYAVqq3tFcsMyq7kOeYo_m10H0c7mai-efuQ; lms_ads=AQG_jswcr_3k4QAAAZGD5BTU10ZLYUbHrdVBC5G5ibUnwUFgqUUzZi3TcYibwgkPuCS5yOvr8IEdGTZaaNYpI8L59_-qCxKw; lms_analytics=AQG_jswcr_3k4QAAAZGD5BTU10ZLYUbHrdVBC5G5ibUnwUFgqUUzZi3TcYibwgkPuCS5yOvr8IEdGTZaaNYpI8L59_-qCxKw; UserMatchHistory=AQJq7O-MdeqlTAAAAZGEROiHxZb1nVNSZHaHCtBkTr2-TS-uzZ9OMwHqLIGyNco5r_WJT0JCK_c4Je-L8_N_12EI24q28dUO-6jIAl3csLNCHFS3IHihRXAG9CRf6rKyFZbGJnDSvQ1x3K-ZbFyjM7wW31Oofaa1SfKYlnl0sS-3bf2Ne_jbs4hkGdh_5KQMFmWuQ49tnRawbaXbmZHvODPXuCWphHKXhum5-wEpB0DHSmvnDBzhgbop8b_1NJ-GZcbHVBybgqfsXQuu_VW6uGyFLPyBAMnTYqHHlI9skzjlz3z7bhIDA9UphW-RJZZ8m42vfMoV5z1G_rm066N6h1w-T8ozBjxDV3m8lngF_qckgDyYfQ; lidc="b=TGST04:s=T:r=T:a=T:p=T:g=3276:u=1:x=1:i=1724501524:t=1724587924:v=2:sig=AQFTxZyPRjePYQ5yp40iknPMQWcDJr0Q"'),
    "dnt": "1",
    "origin": "https://abb-bank.az",
    "referer": "https://abb-bank.az/",
    "sec-ch-ua": '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
}

# Define the payload
payload = {
    "pids": [2233401],
    "scriptVersion": 172,
    "time": 1724501974645,
    "domain": "abb-bank.az",
    "hem": None,
    "isLinkedInApp": False,
    "isTranslated": False,
    "liFatId": "",
    "liGiant": "",
    "misc": {
        "psbState": -4
    },
    "pageTitle": "ATM-lər",
    "signalType": "PAGE_VISIT",
    "url": "https://abb-bank.az/az/xidmet-shebekesi/atm",
    "websiteSignalRequestId": "bfe283ff-3e77-f9b2-4ba5-cc762bfc17a8"
}

# Send the POST request
response = requests.post(url, headers=headers, json=payload)

# Print the response (if any)
print(response.text)
