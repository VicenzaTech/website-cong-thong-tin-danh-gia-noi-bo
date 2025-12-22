import pandas as pd
import json
import os
import sys

# Set UTF-8 encoding for console output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

# Đọc danh sách trưởng phòng
def read_truong_phong():
    truong_phong_dict = {}
    with open('danh-sach-truong-phong.md', 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if ':' in line:
                phong_ban, ten = line.split(':', 1)
                truong_phong_dict[ten.strip()] = phong_ban.strip()
    return truong_phong_dict

# Đọc file Excel
def convert_excel_to_json():
    # Đọc file Excel
    file_name = 'Anh Hồng - Danh sách nhân sự - VICENZA.xlsx'
    df = pd.read_excel(file_name, sheet_name='Nhân sự Văn phòng', header=1)
    
    # Loại bỏ các hàng trống hoàn toàn
    df = df.dropna(how='all')
    
    # Đọc danh sách trưởng phòng
    truong_phong_dict = read_truong_phong()
    truong_phong_names = set(truong_phong_dict.keys())
    
    # Danh sách phòng ban
    phong_ban_list = [
        "Hội đồng Cổ đông",
        "Hội đồng Quản trị",
        "Ban Tổng Giám đốc",
        "Phòng Tổ chức - Hành chính",
        "Ban Đầu tư",
        "Phòng Khai thác",
        "Ban Kinh doanh",
        "Ban Kiểm soát",
        "Phòng Kế toán",
        "Dự án Cát nhân tạo",
        "Văn phòng Chủ tịch hội đồng quản trị",
        "Thanh tra sản xuất - KCS"
    ]
    
    # Chuyển đổi DataFrame thành list of dictionaries
    records = []
    for idx, row in df.iterrows():
        record = {}
        for col in df.columns:
            value = row[col]
            # Chuyển đổi NaN thành None
            if pd.isna(value):
                record[col] = None
            elif isinstance(value, (int, float)):
                # Giữ nguyên số
                record[col] = value
            else:
                # Chuyển đổi thành string
                record[col] = str(value)
        
        # Thêm trường role
        # Tìm tên trong record (thường là cột có tên "Họ và tên" hoặc tương tự)
        ten_nhan_vien = None
        for key in record.keys():
            if isinstance(key, str):
                key_lower = key.lower()
                if 'họ' in key_lower and 'tên' in key_lower:
                    ten_nhan_vien = record[key]
                    break
                elif 'tên' in key_lower and 'nhân' in key_lower:
                    ten_nhan_vien = record[key]
                    break
        
        # Xác định role
        roles = []
        if ten_nhan_vien and ten_nhan_vien in truong_phong_names:
            roles.append("Trưởng phòng")
        
        # Kiểm tra phòng ban của nhân viên
        phong_ban_nhan_vien = None
        for key in record.keys():
            if isinstance(key, str):
                key_lower = key.lower()
                if 'phòng' in key_lower or 'ban' in key_lower:
                    phong_ban_nhan_vien = record[key]
                    break
        
        # Nếu không phải trưởng phòng của phòng ban này, thêm "Nhân viên"
        if phong_ban_nhan_vien:
            if not roles:
                roles.append("Nhân viên")
            else:
                # Kiểm tra xem có phải trưởng phòng của phòng ban này không
                if ten_nhan_vien in truong_phong_names:
                    phong_ban_truong = truong_phong_dict[ten_nhan_vien]
                    if phong_ban_truong != phong_ban_nhan_vien:
                        roles.append("Nhân viên")
        
        record['role'] = ', '.join(roles) if roles else 'Nhân viên'
        
        records.append(record)
    
    # Lưu thành file JSON với encoding UTF-8
    with open('nhan_su_van_phong.json', 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
    
    print(f"Đã chuyển đổi thành công! Tổng số bản ghi: {len(records)}")
    print(f"File JSON đã được lưu: nhan_su_van_phong.json")
    
    # In ra 3 bản ghi đầu tiên để kiểm tra
    print("\n3 bản ghi đầu tiên:")
    print(json.dumps(records[:3], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    convert_excel_to_json()

