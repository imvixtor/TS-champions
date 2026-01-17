/**
 * CSV Utility Functions
 * Hỗ trợ export và import dữ liệu CSV
 */

/**
 * Export dữ liệu ra file CSV
 */
export const exportToCSV = <T extends Record<string, unknown>>(
    data: T[],
    filename: string,
    headers?: string[]
): void => {
    if (data.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }

    // Lấy keys từ object đầu tiên nếu không có headers
    const keys = headers || Object.keys(data[0]);

    // Tạo header row
    const csvHeaders = keys.join(',');

    // Tạo data rows
    const csvRows = data.map(row => {
        return keys.map(key => {
            const value = row[key];
            // Xử lý giá trị có dấu phẩy hoặc dấu ngoặc kép
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    });

    // Kết hợp header và rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Tạo BOM để hỗ trợ UTF-8 (cho tiếng Việt)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

    // Tạo link download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Parse CSV string thành array of objects
 */
export const parseCSV = (csvText: string): Record<string, string>[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    // Parse header
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    const data: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length !== headers.length) {
            console.warn(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
            continue;
        }
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
            row[header.trim()] = values[index]?.trim() || '';
        });
        data.push(row);
    }

    return data;
};

/**
 * Parse một dòng CSV (xử lý quoted values)
 */
const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    // Add last field
    result.push(current);
    return result;
};

/**
 * Đọc file CSV từ input file
 */
export const readCSVFile = (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                // Remove BOM if present
                const csvText = text.replace(/^\uFEFF/, '');
                const data = parseCSV(csvText);
                resolve(data);
            } catch (error) {
                reject(new Error('Lỗi đọc file CSV: ' + (error instanceof Error ? error.message : 'Unknown error')));
            }
        };

        reader.onerror = () => {
            reject(new Error('Lỗi đọc file'));
        };

        reader.readAsText(file, 'UTF-8');
    });
};
