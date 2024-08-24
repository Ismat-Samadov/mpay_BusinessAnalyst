from bs4 import BeautifulSoup
import csv

# Load the HTML file
file_path = 'Terminal xəritəsi _ eManat.html'
with open(file_path, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'lxml')

# Find all the terminal location elements
terminals = soup.find_all('div', class_='TerminalMap_place_item__i7JSK')

# Prepare data for CSV
data = []
for terminal in terminals:
    name = terminal.find('h3').text.strip()
    address = terminal.find('p').text.strip()
    data.append([name, address])

# Define CSV file path
csv_file_path = 'terminal_locations.csv'

# Save data to CSV
with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Name', 'Address'])
    writer.writerows(data)

csv_file_path


