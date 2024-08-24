import requests
import csv

# Fetch terminals data
terminals_response = requests.get("https://pgapi.million.az/general/regions/0/terminals")
terminals_data = terminals_response.json()['terminals']

# Fetch regions data
regions_response = requests.get("https://pgapi.million.az/general/regions")
regions_data = regions_response.json()['regions']

# Create a dictionary for easy lookup of region names by their ID
region_dict = {region['id']: region['name'] for region in regions_data}

# Combine terminal data with the corresponding region names
combined_data = []
for terminal in terminals_data:
    region_name = region_dict.get(terminal['regionId'], "Unknown Region")
    combined_terminal = {
        "id": terminal['id'],
        "address": terminal['address'],
        "longitude": terminal['longitude'],
        "latitude": terminal['latitude'],
        "regionId": terminal['regionId'],
        "regionName": region_name,
        "terminalCode": terminal['terminalCode']
    }
    combined_data.append(combined_terminal)

# Specify the CSV file name
csv_file_name = "terminals_with_regions.csv"

# Write combined data to CSV
with open(csv_file_name, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=combined_terminal.keys())
    writer.writeheader()
    writer.writerows(combined_data)

print(f"Data has been saved to {csv_file_name}")
