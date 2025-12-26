import fs from "fs";
import path from "path";
import type {
  User,
  PhongBan,
  KyDanhGia,
  BieuMau,
  CauHoi,
  DanhGia,
  CauTraLoi,
} from "@/types/schema";

const DB_DIR = path.join(process.cwd(), "data", "db");
const USERS_FILE = path.join(DB_DIR, "users.json");
const PHONGBANS_FILE = path.join(DB_DIR, "phongbans.json");
const KYDANHGIAS_FILE = path.join(DB_DIR, "kydanhgias.json");
const BIEUMAUS_FILE = path.join(DB_DIR, "bieumaus.json");
const CAUHOIS_FILE = path.join(DB_DIR, "cauhois.json");
const DANHGIAS_FILE = path.join(DB_DIR, "danhgias.json");
const CAUTRALOIS_FILE = path.join(DB_DIR, "cautralois.json");

function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDbDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

export const database = {
  users: {
    getAll: (): User[] => {
      return readJsonFile<User[]>(USERS_FILE, []);
    },
    
    save: (users: User[]): void => {
      writeJsonFile(USERS_FILE, users);
    },
    
    getById: (id: string): User | undefined => {
      const users = database.users.getAll();
      return users.find(u => u.id === id && !u.deletedAt);
    },
    
    getByMaNhanVien: (maNhanVien: string): User | undefined => {
      const users = database.users.getAll();
      return users.find(u => u.maNhanVien === maNhanVien && !u.deletedAt);
    },
    
    update: (id: string, data: Partial<User>): User | undefined => {
      const users = database.users.getAll();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return undefined;
      
      users[index] = {
        ...users[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.users.save(users);
      return users[index];
    },
    
    create: (user: User): User => {
      const users = database.users.getAll();
      users.push(user);
      database.users.save(users);
      return user;
    },
    
    delete: (id: string): boolean => {
      const users = database.users.getAll();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return false;
      
      users[index].deletedAt = new Date();
      users[index].updatedAt = new Date();
      database.users.save(users);
      return true;
    },
  },
  
  phongBans: {
    getAll: (): PhongBan[] => {
      return readJsonFile<PhongBan[]>(PHONGBANS_FILE, []);
    },
    
    save: (phongBans: PhongBan[]): void => {
      writeJsonFile(PHONGBANS_FILE, phongBans);
    },
    
    getById: (id: string): PhongBan | undefined => {
      const phongBans = database.phongBans.getAll();
      return phongBans.find(pb => pb.id === id && !pb.deletedAt);
    },
    
    update: (id: string, data: Partial<PhongBan>): PhongBan | undefined => {
      const phongBans = database.phongBans.getAll();
      const index = phongBans.findIndex(pb => pb.id === id);
      if (index === -1) return undefined;
      
      phongBans[index] = {
        ...phongBans[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.phongBans.save(phongBans);
      return phongBans[index];
    },
    
    create: (phongBan: PhongBan): PhongBan => {
      const phongBans = database.phongBans.getAll();
      phongBans.push(phongBan);
      database.phongBans.save(phongBans);
      return phongBan;
    },
    
    delete: (id: string): boolean => {
      const phongBans = database.phongBans.getAll();
      const index = phongBans.findIndex(pb => pb.id === id);
      if (index === -1) return false;
      
      phongBans[index].deletedAt = new Date();
      phongBans[index].updatedAt = new Date();
      database.phongBans.save(phongBans);
      return true;
    },
  },
  
  kyDanhGias: {
    getAll: (): KyDanhGia[] => {
      return readJsonFile<KyDanhGia[]>(KYDANHGIAS_FILE, []);
    },
    
    save: (kyDanhGias: KyDanhGia[]): void => {
      writeJsonFile(KYDANHGIAS_FILE, kyDanhGias);
    },
    
    getById: (id: string): KyDanhGia | undefined => {
      const kyDanhGias = database.kyDanhGias.getAll();
      return kyDanhGias.find(ky => ky.id === id);
    },
    
    update: (id: string, data: Partial<KyDanhGia>): KyDanhGia | undefined => {
      const kyDanhGias = database.kyDanhGias.getAll();
      const index = kyDanhGias.findIndex(ky => ky.id === id);
      if (index === -1) return undefined;
      
      kyDanhGias[index] = {
        ...kyDanhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.kyDanhGias.save(kyDanhGias);
      return kyDanhGias[index];
    },
    
    create: (kyDanhGia: KyDanhGia): KyDanhGia => {
      const kyDanhGias = database.kyDanhGias.getAll();
      kyDanhGias.push(kyDanhGia);
      database.kyDanhGias.save(kyDanhGias);
      return kyDanhGia;
    },
  },
  
  bieuMaus: {
    getAll: (): BieuMau[] => {
      return readJsonFile<BieuMau[]>(BIEUMAUS_FILE, []);
    },
    
    save: (bieuMaus: BieuMau[]): void => {
      writeJsonFile(BIEUMAUS_FILE, bieuMaus);
    },
    
    getById: (id: string): BieuMau | undefined => {
      const bieuMaus = database.bieuMaus.getAll();
      return bieuMaus.find(bm => bm.id === id && !bm.deletedAt);
    },
    
    update: (id: string, data: Partial<BieuMau>): BieuMau | undefined => {
      const bieuMaus = database.bieuMaus.getAll();
      const index = bieuMaus.findIndex(bm => bm.id === id);
      if (index === -1) return undefined;
      
      bieuMaus[index] = {
        ...bieuMaus[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.bieuMaus.save(bieuMaus);
      return bieuMaus[index];
    },
    
    create: (bieuMau: BieuMau): BieuMau => {
      const bieuMaus = database.bieuMaus.getAll();
      bieuMaus.push(bieuMau);
      database.bieuMaus.save(bieuMaus);
      return bieuMau;
    },
    
    delete: (id: string): boolean => {
      const bieuMaus = database.bieuMaus.getAll();
      const index = bieuMaus.findIndex(bm => bm.id === id);
      if (index === -1) return false;
      
      bieuMaus[index].deletedAt = new Date();
      bieuMaus[index].updatedAt = new Date();
      database.bieuMaus.save(bieuMaus);
      return true;
    },
  },
  
  cauHois: {
    getAll: (): CauHoi[] => {
      return readJsonFile<CauHoi[]>(CAUHOIS_FILE, []);
    },
    
    save: (cauHois: CauHoi[]): void => {
      writeJsonFile(CAUHOIS_FILE, cauHois);
    },
    
    getById: (id: string): CauHoi | undefined => {
      const cauHois = database.cauHois.getAll();
      return cauHois.find(ch => ch.id === id);
    },
    
    update: (id: string, data: Partial<CauHoi>): CauHoi | undefined => {
      const cauHois = database.cauHois.getAll();
      const index = cauHois.findIndex(ch => ch.id === id);
      if (index === -1) return undefined;
      
      cauHois[index] = {
        ...cauHois[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.cauHois.save(cauHois);
      return cauHois[index];
    },
    
    create: (cauHoi: CauHoi): CauHoi => {
      const cauHois = database.cauHois.getAll();
      cauHois.push(cauHoi);
      database.cauHois.save(cauHois);
      return cauHoi;
    },
    
    delete: (id: string): boolean => {
      const cauHois = database.cauHois.getAll();
      const index = cauHois.findIndex(ch => ch.id === id);
      if (index === -1) return false;
      
      cauHois.splice(index, 1);
      database.cauHois.save(cauHois);
      return true;
    },
  },
  
  danhGias: {
    getAll: (): DanhGia[] => {
      return readJsonFile<DanhGia[]>(DANHGIAS_FILE, []);
    },
    
    save: (danhGias: DanhGia[]): void => {
      writeJsonFile(DANHGIAS_FILE, danhGias);
    },
    
    getById: (id: string): DanhGia | undefined => {
      const danhGias = database.danhGias.getAll();
      return danhGias.find(dg => dg.id === id);
    },
    
    update: (id: string, data: Partial<DanhGia>): DanhGia | undefined => {
      const danhGias = database.danhGias.getAll();
      const index = danhGias.findIndex(dg => dg.id === id);
      if (index === -1) return undefined;
      
      danhGias[index] = {
        ...danhGias[index],
        ...data,
        updatedAt: new Date(),
      };
      
      database.danhGias.save(danhGias);
      return danhGias[index];
    },
    
    create: (danhGia: DanhGia): DanhGia => {
      const danhGias = database.danhGias.getAll();
      danhGias.push(danhGia);
      database.danhGias.save(danhGias);
      return danhGia;
    },
  },
  
  cauTraLois: {
    getAll: (): CauTraLoi[] => {
      return readJsonFile<CauTraLoi[]>(CAUTRALOIS_FILE, []);
    },
    
    save: (cauTraLois: CauTraLoi[]): void => {
      writeJsonFile(CAUTRALOIS_FILE, cauTraLois);
    },
  },
  
  initialize: (): void => {
    ensureDbDir();
  },

  seed: (mockData: {
    users: User[];
    phongBans: PhongBan[];
    kyDanhGias: KyDanhGia[];
    bieuMaus: BieuMau[];
    cauHois: CauHoi[];
    danhGias: DanhGia[];
    cauTraLois: CauTraLoi[];
  }): void => {
    ensureDbDir();
    
    if (!fs.existsSync(USERS_FILE)) {
      database.users.save(mockData.users);
    }
    if (!fs.existsSync(PHONGBANS_FILE)) {
      database.phongBans.save(mockData.phongBans);
    }
    if (!fs.existsSync(KYDANHGIAS_FILE)) {
      database.kyDanhGias.save(mockData.kyDanhGias);
    }
    if (!fs.existsSync(BIEUMAUS_FILE)) {
      database.bieuMaus.save(mockData.bieuMaus);
    }
    if (!fs.existsSync(CAUHOIS_FILE)) {
      database.cauHois.save(mockData.cauHois);
    }
    if (!fs.existsSync(DANHGIAS_FILE)) {
      database.danhGias.save(mockData.danhGias);
    }
    if (!fs.existsSync(CAUTRALOIS_FILE)) {
      database.cauTraLois.save(mockData.cauTraLois);
    }
  },
};

