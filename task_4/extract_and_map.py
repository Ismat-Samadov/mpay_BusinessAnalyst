from bs4 import BeautifulSoup
import pandas as pd

# Load the HTML content
file_path = 'task_4/data.html'
with open(file_path, 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML content using BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Find all terminal items
terminal_items = soup.find_all('div', class_='TerminalMap_place_item__i7JSK')

# Extract the data
data = []
for item in terminal_items:
    name = item.find('h3').text.strip()
    address = item.find('p').text.strip()
    data.append({"name": name, "address": address})

# Convert the data to a pandas DataFrame
df = pd.DataFrame(data)

# Define the list of regions
regions = [
    "Abşeron", "Ağdam", "Ağdaş", "Ağcabədi", "Ağstafa", "Ağsu", "Astara", "Babək", "Balakən", 
    "Bərdə", "Beyləqan", "Biləsuvar", "Cəbrayıl", "Cəlilabad", "Culfa", "Daşkəsən", "Füzuli", 
    "Gədəbəy", "Goranboy", "Göyçay", "Göygöl", "Hacıqabul", "Xaçmaz", "Xızı", "Xocalı", 
    "Xocavənd", "İmişli", "İsmayıllı", "Kəlbəcər", "Kəngərli", "Kürdəmir", "Qəbələ", "Qax", 
    "Qazax", "Qobustan", "Quba", "Qubadlı", "Qusar", "Laçın", "Lənkəran", "Lerik", "Masallı", 
    "Neftçala", "Oğuz", "Ordubad", "Saatlı", "Sabirabad", "Sədərək", "Salyan", "Samux", 
    "Şabran", "Şahbuz", "Şəki", "Şamaxı", "Şəmkir", "Şərur", "Şuşa", "Siyəzən", "Tərtər", 
    "Tovuz", "Ucar", "Yardımlı", "Yevlax", "Zəngilan", "Zaqatala", "Zərdab"
]

# Define a function to match regions based on substring presence in the address
def determine_region_by_substring(address):
    for region in regions:
        if region in address:
            return region
    return "Other"

# Apply the function to the 'address' column
df['region'] = df['address'].apply(determine_region_by_substring)

# Save the DataFrame to an Excel file
output_file_path = 'task_4/terminal_data_with_regions.xlsx'
df.to_excel(output_file_path, index=False)

output_file_path
