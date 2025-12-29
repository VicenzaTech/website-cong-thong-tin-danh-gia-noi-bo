import pandas as pd
import sys
import json
from datetime import datetime

# Set UTF-8 encoding for output
sys.stdout.reconfigure(encoding='utf-8')

# Đọc file Excel, sheet "Tổng hợp điểm phạt"
excel_file = "XLKL - 2025.xlsx"
sheet_name = "Tổng hợp điểm phạt"

# Đọc header từ hàng 7 (index 6 trong pandas, vì bắt đầu từ 0)
# Đọc data từ hàng 8 đến 250 (index 7 đến 249)
df = pd.read_excel(
    excel_file,
    sheet_name=sheet_name,
    header=6,  # Hàng 7 là header (0-indexed = 6)
    nrows=243  # Từ hàng 8 đến 250 = 243 dòng (250 - 8 + 1 = 243)
)

# Xóa các cột hoàn toàn trống
df = df.dropna(axis=1, how='all')

# Xóa các hàng hoàn toàn trống
df = df.dropna(axis=0, how='all')

# Reset index
df = df.reset_index(drop=True)

# Hàm để chuyển đổi giá trị sang TypeScript format
def to_ts_value(value):
    """Chuyển đổi giá trị sang format TypeScript"""
    if pd.isna(value) or value == '':
        return 'null'
    if isinstance(value, (int, float)):
        # Nếu là số nguyên, trả về số nguyên, nếu không trả về số thập phân
        if isinstance(value, float) and value.is_integer():
            return str(int(value))
        return str(value)
    if isinstance(value, bool):
        return 'true' if value else 'false'
    # String - escape và wrap trong quotes
    value_str = str(value)
    # Escape backslashes và quotes
    value_str = value_str.replace('\\', '\\\\').replace('"', '\\"')
    return f'"{value_str}"'

# Hàm để chuyển đổi tên cột thành camelCase cho TypeScript
def to_camel_case(name):
    """Chuyển đổi tên cột thành camelCase"""
    # Loại bỏ khoảng trắng và ký tự đặc biệt
    words = str(name).strip().split()
    if not words:
        return 'field'
    # Chữ cái đầu tiên viết thường, các chữ cái đầu của từ tiếp theo viết hoa
    camel = words[0].lower()
    for word in words[1:]:
        if word:
            camel += word[0].upper() + word[1:].lower()
    return camel

# Tạo mapping từ tên cột gốc sang tên camelCase
column_mapping = {}
for col in df.columns:
    camel_name = to_camel_case(col)
    column_mapping[col] = camel_name

# Xác định kiểu dữ liệu cho từng cột
column_types = {}
for col in df.columns:
    camel_name = column_mapping[col]
    # Kiểm tra tất cả giá trị không null trong cột
    non_null_values = df[col].dropna()
    if len(non_null_values) > 0:
        # Kiểm tra xem có phải tất cả đều là số không
        all_numeric = True
        for val in non_null_values:
            if not isinstance(val, (int, float)):
                try:
                    float(val)
                except (ValueError, TypeError):
                    all_numeric = False
                    break
        
        if all_numeric:
            column_types[camel_name] = "number | null"
        else:
            column_types[camel_name] = "string | null"
    else:
        # Nếu cột trống, mặc định là string
        column_types[camel_name] = "string | null"

# Tạo TypeScript code
ts_lines = []
ts_lines.append("// Generated from Excel file: XLKL - 2025.xlsx")
ts_lines.append("// Sheet: Tổng hợp điểm phạt")
ts_lines.append("// Data from row 8 to 250, header at row 7")
ts_lines.append("")
ts_lines.append("export interface TongHopDiemPhat {")

# Thêm interface properties
for col in df.columns:
    camel_name = column_mapping[col]
    ts_type = column_types[camel_name]
    ts_lines.append(f"  {camel_name}: {ts_type};")

ts_lines.append("}")
ts_lines.append("")
ts_lines.append("export const tongHopDiemPhats: TongHopDiemPhat[] = [")

# Chuyển đổi từng hàng thành object TypeScript
for idx, row in df.iterrows():
    ts_lines.append("  {")
    for col in df.columns:
        camel_name = column_mapping[col]
        value = row[col]
        # Kiểm tra kiểu dữ liệu của cột để chuyển đổi đúng
        col_type = column_types[camel_name]
        if col_type == "number | null":
            if pd.isna(value) or value == '':
                ts_value = 'null'
            else:
                # Đảm bảo là số
                try:
                    num_val = float(value)
                    if num_val.is_integer():
                        ts_value = str(int(num_val))
                    else:
                        ts_value = str(num_val)
                except (ValueError, TypeError):
                    ts_value = 'null'
        else:
            ts_value = to_ts_value(value)
        ts_lines.append(f"    {camel_name}: {ts_value},")
    ts_lines.append("  },")

ts_lines.append("];")

# Ghi vào file
output_file = "tongHopDiemPhat.ts"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(ts_lines))

print(f"Đã tạo file TypeScript: {output_file}")
print(f"Tổng số bản ghi: {len(df)}")
print(f"\nCác cột đã chuyển đổi:")
for col, camel in column_mapping.items():
    print(f"  {col} -> {camel}")
