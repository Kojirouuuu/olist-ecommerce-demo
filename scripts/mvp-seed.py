import pandas as pd
from tqdm import tqdm
from dotenv import load_dotenv
from sqlalchemy import create_engine

import uuid
from datetime import datetime

from re import I
from numpy import int64

from pathlib import Path
import os

# 環境変数を読み込む
# .env.exampleを参考に.envを作成しよう！
load_dotenv()

engine = os.getenv("DATABASE_URL")

# prismaが勝手に作成するDATABASE_URLには?schemaが語尾につくので、念の為削除
if "?" in engine:
    engine = engine.split("?")[0]

# SQLAlchemyのEngineを作成
engine = create_engine(engine)

print(f"Let's set up Postgres database: {engine}")

# 相対パス用
base = os.getcwd()

# 適宜parentを付ける
# p = Path.cwd()
p = Path.cwd().parent
dir = os.path.join(p, "archive/")

translation_file = os.path.join(dir, "product_category_name_translation.csv")
product_file = os.path.join(dir, "olist_products_dataset.csv")
order_items_file = os.path.join(dir, "olist_order_items_dataset.csv")

print("Roading the file ...")
print(f" - {os.path.relpath(translation_file, base)}")
print(f" - {os.path.relpath(product_file, base)}")
print(f" - {os.path.relpath(order_items_file, base)}")

translation_df = pd.read_csv(translation_file)
product_df = pd.read_csv(product_file)
order_items_df = pd.read_csv(order_items_file)

# データベース挿入処理
import uuid
from datetime import datetime

print("Start seeding...")

# 1. カテゴリ翻訳データの挿入
print("\n1. Inserting category translations...")
translation_map = {}

# BOM文字を削除（必要に応じて）
translation_df.columns = translation_df.columns.str.replace('\ufeff', '', regex=False)

# 翻訳マップを作成
for _, row in translation_df.iterrows():
    category_name = row['product_category_name']
    category_name_eng = row['product_category_name_english']
    if pd.notna(category_name) and pd.notna(category_name_eng):
        translation_map[category_name] = category_name_eng

# データベース用のデータフレームを作成（Prismaスキーマの@mapに合わせてカラム名を設定）
translation_db_df = translation_df.copy()
translation_db_df = translation_db_df.rename(columns={
    'product_category_name': 'product_category_name',
    'product_category_name_english': 'product_category_name_english'
})
translation_db_df = translation_db_df[['product_category_name', 'product_category_name_english']].dropna()

# データベースに挿入
if len(translation_db_df) > 0:
    translation_db_df.to_sql(
        'product_category_name_translation',
        engine,
        if_exists='append',
        index=False,
        method='multi'
    )
    print(f"Inserted {len(translation_db_df)} translations into database.")

print(f"Loaded {len(translation_map)} translations.")

# 2. 製品データの挿入
print("\n2. Inserting products...")

# 製品データを整形
products_data = []

for _, row in product_df.iterrows():
    if pd.notna(row['product_id']):
        category_name = row['product_category_name'] if pd.notna(row['product_category_name']) else 'uncategorized'
        category_name_eng = translation_map.get(category_name, category_name)
        
        product_dict = {
            'product_id': row['product_id'],  # Prismaスキーマでは@map("product_id")でidフィールドにマッピング
            'product_category_name': category_name_eng,
            'description': f'Product in category {category_name_eng}',
            'product_name_lenght': int(row['product_name_lenght']) if pd.notna(row['product_name_lenght']) else None,
            'product_description_lenght': int(row['product_description_lenght']) if pd.notna(row['product_description_lenght']) else None,
            'product_photos_qty': int(row['product_photos_qty']) if pd.notna(row['product_photos_qty']) else None,
            'product_weight_g': int(row['product_weight_g']) if pd.notna(row['product_weight_g']) else None,
            'product_length_cm': int(row['product_length_cm']) if pd.notna(row['product_length_cm']) else None,
            'product_height_cm': int(row['product_height_cm']) if pd.notna(row['product_height_cm']) else None,
            'product_width_cm': int(row['product_width_cm']) if pd.notna(row['product_width_cm']) else None,
        }
        products_data.append(product_dict)

products_db_df = pd.DataFrame(products_data)
print(f"Parsed {len(products_db_df)} products. Inserting into DB...")

# データベースに挿入
if len(products_db_df) > 0:
    products_db_df.to_sql(
        'products',
        engine,
        if_exists='append',
        index=False,
        method='multi'
    )
    print(f"Inserted {len(products_db_df)} products into database.")

# 3. 注文アイテムデータの挿入
print("\n3. Inserting order items...")

# 注文アイテムデータを整形
order_items_data = []

for _, row in order_items_df.iterrows():
    order_item_dict = {
        'id': str(uuid.uuid4()),  # UUIDを生成（PrismaスキーマではidフィールドがUUID）
        'order_id': row['order_id'],
        'order_item_id': str(row['order_item_id']),
        'product_id': row['product_id'],
        'shipping_limit_date': pd.to_datetime(row['shipping_limit_date']),
        'price': float(row['price']),
        'freight_value': float(row['freight_value']),  # Prismaスキーマでは@map("freight_value")でfreightフィールドにマッピング
    }
    order_items_data.append(order_item_dict)

order_items_db_df = pd.DataFrame(order_items_data)
print(f"Parsed {len(order_items_db_df)} order items. Inserting into DB...")

# バッチ処理で挿入（5000件ずつ）
SLICE_SIZE = 5000
total_items = len(order_items_db_df)

for i in tqdm(range(0, total_items, SLICE_SIZE), desc="Inserting order items"):
    slice_df = order_items_db_df.iloc[i:i + SLICE_SIZE]
    slice_df.to_sql(
        'order_items',
        engine,
        if_exists='append',
        index=False,
        method='multi'
    )

print("Seeding finished.")
