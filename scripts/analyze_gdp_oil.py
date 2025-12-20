import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import MinMaxScaler
import warnings
warnings.filterwarnings('ignore')

# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (14, 8)

# Load GDP data
print("Loading GDP data...")
gdp_df = pd.read_csv('data/API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_51/API_NY.GDP.MKTP.KD.ZG_DS2_en_csv_v2_51.csv', skiprows=4)

# Filter for Azerbaijan
azerbaijan_gdp = gdp_df[gdp_df['Country Code'] == 'AZE']

# Transform from wide to long format
year_columns = [col for col in azerbaijan_gdp.columns if col.isdigit()]
gdp_long = azerbaijan_gdp.melt(
    id_vars=['Country Name', 'Country Code'],
    value_vars=year_columns,
    var_name='Year',
    value_name='GDP_Growth'
)

# Convert Year to integer and GDP_Growth to float
gdp_long['Year'] = gdp_long['Year'].astype(int)
gdp_long['GDP_Growth'] = pd.to_numeric(gdp_long['GDP_Growth'], errors='coerce')

# Remove rows with missing GDP values
gdp_long = gdp_long.dropna(subset=['GDP_Growth'])

print(f"GDP data shape: {gdp_long.shape}")
print(f"GDP data years: {gdp_long['Year'].min()} to {gdp_long['Year'].max()}")

# Load Azerlight oil price data
print("\nLoading Azerlight oil price data...")
oil_df = pd.read_excel('data/azerlight.xlsx')
oil_df['Day'] = pd.to_datetime(oil_df['Day'])
oil_df['Year'] = oil_df['Day'].dt.year

print(f"Oil price data shape: {oil_df.shape}")
print(f"Oil price data years: {oil_df['Year'].min()} to {oil_df['Year'].max()}")

# Calculate yearly average oil prices
oil_yearly = oil_df.groupby('Year')['Azeri Light'].agg(['mean', 'std', 'min', 'max']).reset_index()
oil_yearly.columns = ['Year', 'Oil_Price_Mean', 'Oil_Price_Std', 'Oil_Price_Min', 'Oil_Price_Max']

print(f"\nYearly oil price data shape: {oil_yearly.shape}")

# Merge GDP and oil price data
print("\nMerging datasets...")
merged_df = pd.merge(gdp_long, oil_yearly, on='Year', how='inner')
print(f"Merged data shape: {merged_df.shape}")
print(f"Merged data years: {merged_df['Year'].min()} to {merged_df['Year'].max()}")

# Normalize the data using MinMaxScaler
print("\nNormalizing data...")
scaler_gdp = MinMaxScaler()
scaler_oil = MinMaxScaler()

merged_df['GDP_Growth_Normalized'] = scaler_gdp.fit_transform(merged_df[['GDP_Growth']])
merged_df['Oil_Price_Normalized'] = scaler_oil.fit_transform(merged_df[['Oil_Price_Mean']])

print("\nData preparation complete!")
print("\n" + "="*80)
print("Summary Statistics:")
print("="*80)
print("\nGDP Growth (%):")
print(merged_df['GDP_Growth'].describe())
print("\nAzeri Light Oil Price (USD/barrel):")
print(merged_df['Oil_Price_Mean'].describe())

# Calculate correlation
correlation = merged_df['GDP_Growth'].corr(merged_df['Oil_Price_Mean'])
print(f"\nCorrelation between GDP Growth and Oil Price: {correlation:.4f}")

# Save processed data
merged_df.to_csv('data/processed_data.csv', index=False)
print("\nProcessed data saved to: data/processed_data.csv")

# ============================================================================
# CHART 1: GDP Growth and Oil Price (Original Values) - Time Series
# ============================================================================
print("\nCreating Chart 1: Time Series (Original Values)...")
fig, ax1 = plt.subplots(figsize=(16, 8))

color1 = 'tab:blue'
ax1.set_xlabel('Year', fontsize=14, fontweight='bold')
ax1.set_ylabel('GDP Growth (%)', color=color1, fontsize=14, fontweight='bold')
line1 = ax1.plot(merged_df['Year'], merged_df['GDP_Growth'], color=color1, linewidth=2.5,
                 marker='o', markersize=6, label='GDP Growth (%)', alpha=0.8)
ax1.tick_params(axis='y', labelcolor=color1, labelsize=12)
ax1.tick_params(axis='x', labelsize=12)
ax1.grid(True, alpha=0.3)
ax1.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.5)

ax2 = ax1.twinx()
color2 = 'tab:orange'
ax2.set_ylabel('Azeri Light Oil Price (USD/barrel)', color=color2, fontsize=14, fontweight='bold')
line2 = ax2.plot(merged_df['Year'], merged_df['Oil_Price_Mean'], color=color2, linewidth=2.5,
                 marker='s', markersize=6, label='Azeri Light Oil Price', alpha=0.8)
ax2.tick_params(axis='y', labelcolor=color2, labelsize=12)

# Add title
plt.title('Azerbaijan GDP Growth vs Azeri Light Oil Price (2000-2024)',
          fontsize=16, fontweight='bold', pad=20)

# Combine legends from both axes
lines = line1 + line2
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper left', fontsize=12, framealpha=0.95,
          edgecolor='black', fancybox=True, shadow=True)

# Add correlation text box in bottom right
ax1.text(0.98, 0.02, f'Correlation: {correlation:.4f}',
         transform=ax1.transAxes, fontsize=12,
         verticalalignment='bottom', horizontalalignment='right',
         bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.9, edgecolor='black'))

plt.tight_layout()
plt.savefig('charts/1_gdp_oil_timeseries.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/1_gdp_oil_timeseries.png")
plt.close()

# ============================================================================
# CHART 2: Normalized Data Comparison
# ============================================================================
print("Creating Chart 2: Normalized Data Comparison...")
fig, ax = plt.subplots(figsize=(16, 8))

ax.plot(merged_df['Year'], merged_df['GDP_Growth_Normalized'],
        color='tab:blue', linewidth=2.5, marker='o', markersize=6,
        label='GDP Growth (Normalized)', alpha=0.8)
ax.plot(merged_df['Year'], merged_df['Oil_Price_Normalized'],
        color='tab:orange', linewidth=2.5, marker='s', markersize=6,
        label='Oil Price (Normalized)', alpha=0.8)

ax.set_xlabel('Year', fontsize=14, fontweight='bold')
ax.set_ylabel('Normalized Value (0-1 scale)', fontsize=14, fontweight='bold')
ax.set_title('Normalized Comparison: Azerbaijan GDP Growth vs Azeri Light Oil Price',
             fontsize=16, fontweight='bold', pad=20)
ax.legend(loc='upper left', fontsize=12, framealpha=0.95,
         edgecolor='black', fancybox=True, shadow=True)
ax.grid(True, alpha=0.3)
ax.tick_params(labelsize=12)

# Add correlation text box in bottom right
ax.text(0.98, 0.02, f'Correlation: {correlation:.4f}',
        transform=ax.transAxes, fontsize=12,
        verticalalignment='bottom', horizontalalignment='right',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.9, edgecolor='black'))

plt.tight_layout()
plt.savefig('charts/2_normalized_comparison.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/2_normalized_comparison.png")
plt.close()

# ============================================================================
# CHART 3: Scatter Plot with Regression Line
# ============================================================================
print("Creating Chart 3: Scatter Plot with Regression...")
fig, ax = plt.subplots(figsize=(12, 8))

# Scatter plot
scatter = ax.scatter(merged_df['Oil_Price_Mean'], merged_df['GDP_Growth'],
                     c=merged_df['Year'], cmap='viridis', s=150, alpha=0.7,
                     edgecolors='black', linewidth=1)

# Add regression line
z = np.polyfit(merged_df['Oil_Price_Mean'], merged_df['GDP_Growth'], 1)
p = np.poly1d(z)
ax.plot(merged_df['Oil_Price_Mean'], p(merged_df['Oil_Price_Mean']),
        "r--", linewidth=2.5, alpha=0.8, label=f'Linear fit: y={z[0]:.3f}x+{z[1]:.3f}')

# Add colorbar
cbar = plt.colorbar(scatter, ax=ax)
cbar.set_label('Year', fontsize=12, fontweight='bold')
cbar.ax.tick_params(labelsize=10)

ax.set_xlabel('Azeri Light Oil Price (USD/barrel)', fontsize=14, fontweight='bold')
ax.set_ylabel('GDP Growth (%)', fontsize=14, fontweight='bold')
ax.set_title('Relationship: GDP Growth vs Oil Price (Color-coded by Year)',
             fontsize=16, fontweight='bold', pad=20)
ax.grid(True, alpha=0.3)
ax.legend(fontsize=12, framealpha=0.95, loc='upper right',
         edgecolor='black', fancybox=True, shadow=True)
ax.tick_params(labelsize=12)

# Add correlation text box in bottom right
ax.text(0.98, 0.02, f'Correlation: {correlation:.4f}',
        transform=ax.transAxes, fontsize=12,
        verticalalignment='bottom', horizontalalignment='right',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.9, edgecolor='black'))

plt.tight_layout()
plt.savefig('charts/3_scatter_regression.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/3_scatter_regression.png")
plt.close()

# ============================================================================
# CHART 4: Bar Chart Comparison by Decade
# ============================================================================
print("Creating Chart 4: Decade Comparison...")
merged_df['Decade'] = (merged_df['Year'] // 10) * 10
decade_stats = merged_df.groupby('Decade').agg({
    'GDP_Growth': 'mean',
    'Oil_Price_Mean': 'mean'
}).reset_index()

fig, ax1 = plt.subplots(figsize=(12, 8))

x = np.arange(len(decade_stats))
width = 0.35

color1 = 'tab:blue'
bars1 = ax1.bar(x - width/2, decade_stats['GDP_Growth'], width,
                label='Avg GDP Growth (%)', color=color1, alpha=0.8,
                edgecolor='black', linewidth=1.5)
ax1.set_ylabel('Average GDP Growth (%)', color=color1, fontsize=14, fontweight='bold')
ax1.tick_params(axis='y', labelcolor=color1, labelsize=12)
ax1.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.5)

ax2 = ax1.twinx()
color2 = 'tab:orange'
bars2 = ax2.bar(x + width/2, decade_stats['Oil_Price_Mean'], width,
                label='Avg Oil Price (USD/barrel)', color=color2, alpha=0.8,
                edgecolor='black', linewidth=1.5)
ax2.set_ylabel('Average Oil Price (USD/barrel)', color=color2, fontsize=14, fontweight='bold')
ax2.tick_params(axis='y', labelcolor=color2, labelsize=12)

ax1.set_xlabel('Decade', fontsize=14, fontweight='bold')
ax1.set_title('Average GDP Growth and Oil Price by Decade',
              fontsize=16, fontweight='bold', pad=20)
ax1.set_xticks(x)
ax1.set_xticklabels([f"{int(d)}s" for d in decade_stats['Decade']], fontsize=12)
ax1.tick_params(axis='x', labelsize=12)

# Combine legends
lines = [bars1, bars2]
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper left', fontsize=12, framealpha=0.9)

ax1.grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('charts/4_decade_comparison.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/4_decade_comparison.png")
plt.close()

# ============================================================================
# CHART 5: Heatmap - Year-over-Year Changes
# ============================================================================
print("Creating Chart 5: Heatmap of Changes...")
merged_df['GDP_Change'] = merged_df['GDP_Growth'].diff()
merged_df['Oil_Change'] = merged_df['Oil_Price_Mean'].pct_change() * 100

# Create a correlation matrix
recent_data = merged_df[['GDP_Growth', 'Oil_Price_Mean', 'GDP_Change', 'Oil_Change']].dropna()
correlation_matrix = recent_data.corr()

fig, ax = plt.subplots(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, fmt='.3f', cmap='coolwarm',
            center=0, square=True, linewidths=2, cbar_kws={"shrink": 0.8},
            annot_kws={'size': 14, 'weight': 'bold'}, ax=ax)

ax.set_title('Correlation Matrix: GDP and Oil Price Metrics',
             fontsize=16, fontweight='bold', pad=20)
ax.set_xticklabels(['GDP Growth', 'Oil Price', 'GDP Change', 'Oil Price Change (%)'],
                   fontsize=12, rotation=45, ha='right')
ax.set_yticklabels(['GDP Growth', 'Oil Price', 'GDP Change', 'Oil Price Change (%)'],
                   fontsize=12, rotation=0)

plt.tight_layout()
plt.savefig('charts/5_correlation_heatmap.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/5_correlation_heatmap.png")
plt.close()

# ============================================================================
# CHART 6: Oil Price Volatility vs GDP Growth
# ============================================================================
print("Creating Chart 6: Oil Price Volatility Analysis...")
fig, ax1 = plt.subplots(figsize=(16, 8))

color1 = 'tab:blue'
ax1.set_xlabel('Year', fontsize=14, fontweight='bold')
ax1.set_ylabel('GDP Growth (%)', color=color1, fontsize=14, fontweight='bold')
line1 = ax1.plot(merged_df['Year'], merged_df['GDP_Growth'], color=color1,
                 linewidth=2.5, marker='o', markersize=6, label='GDP Growth (%)', alpha=0.8)
ax1.tick_params(axis='y', labelcolor=color1, labelsize=12)
ax1.tick_params(axis='x', labelsize=12)
ax1.grid(True, alpha=0.3)
ax1.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.5)

ax2 = ax1.twinx()
color2 = 'tab:red'
ax2.set_ylabel('Oil Price Standard Deviation (USD)', color=color2, fontsize=14, fontweight='bold')
line2 = ax2.plot(merged_df['Year'], merged_df['Oil_Price_Std'], color=color2,
                 linewidth=2.5, marker='^', markersize=6,
                 label='Oil Price Volatility (Std Dev)', alpha=0.8)
ax2.tick_params(axis='y', labelcolor=color2, labelsize=12)

plt.title('Azerbaijan GDP Growth vs Azeri Light Oil Price Volatility',
          fontsize=16, fontweight='bold', pad=20)

lines = line1 + line2
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper left', fontsize=12, framealpha=0.9)

plt.tight_layout()
plt.savefig('charts/6_oil_volatility_gdp.png', dpi=300, bbox_inches='tight')
print("Chart saved: charts/6_oil_volatility_gdp.png")
plt.close()

print("\n" + "="*80)
print("Analysis Complete!")
print("="*80)
print(f"\nAll charts have been saved to: /Users/ismatsamadov/gdp_and_oil_price_analyse/charts/")
print("\nGenerated chart files:")
print("  - 1_gdp_oil_timeseries.png - Time series of both metrics")
print("  - 2_normalized_comparison.png - Normalized values for direct comparison")
print("  - 3_scatter_regression.png - Relationship analysis with trend line")
print("  - 4_decade_comparison.png - Average values by decade")
print("  - 5_correlation_heatmap.png - Correlation matrix")
print("  - 6_oil_volatility_gdp.png - Oil price volatility vs GDP growth")
print("\nProcessed data saved to:")
print("  - data/processed_data.csv - Processed and merged dataset")
print("\n" + "="*80)
