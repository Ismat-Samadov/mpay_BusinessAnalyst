import requests
import csv

# List of APIs and corresponding function names
api_urls = [
    "https://www.kapitalbank.az/locations/region?is_nfc=false&weekend=false&type=payment_terminal",
    "https://www.kapitalbank.az/locations/region?is_nfc=false&weekend=false&type=cash_in",
    "https://www.kapitalbank.az/locations/region?is_nfc=false&weekend=false&type=atm",
    "https://www.kapitalbank.az/locations/region?is_nfc=false&weekend=false&type=branch",
    "https://www.kapitalbank.az/locations/region?is_nfc=false&weekend=false&type=reqemsal-merkez"
]

# Prepare data for CSV
data = []

for url in api_urls:
    response = requests.get(url)
    response_data = response.json()
    
    # Extract function name from URL
    function_name = url.split('=')[-1]
    
    for item in response_data:
        item['function'] = function_name
        data.append(item)

# Define CSV file path
csv_file_path = 'combined_terminal_locations.csv'

# Define CSV headers based on the keys from the JSON data
headers = list(data[0].keys())

# Save data to CSV
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)

print(f"Data saved to {csv_file_path}")
