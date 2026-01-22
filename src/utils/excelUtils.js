import * as XLSX from 'xlsx';

export const parseExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        console.log('解析后的数据样本:', jsonData.slice(0, 3));
        console.log('检测到的列:', columns);
        resolve({ data: jsonData, columns });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const detectColumnType = (columnName, data) => {
  if (data.length === 0) return 'string';

  const values = data.map(row => row[columnName]).filter(val => val !== null && val !== undefined && val !== '');

  if (values.length === 0) return 'string';

  console.log(`检测列 "${columnName}" 的值:`, values.slice(0, 5));

  // 首先检查是否是日期
  const dateCount = values.filter(val => {
    const date = parseDate(val);
    return date !== null;
  }).length;
  const dateRatio = dateCount / values.length;

  console.log(`列 "${columnName}" 日期检测: ${dateCount}/${values.length} (${(dateRatio * 100).toFixed(1)}%)`);

  // 日期优先，因为Excel日期也可能被解析为数字
  if (dateRatio > 0.5) {
    console.log(`列 "${columnName}" 识别为日期`);
    return 'date';
  }

  // 然后检查是否是数字
  const numericCount = values.filter(val => {
    const num = parseFloat(val);
    return !isNaN(num) && val !== '' && val !== null && val !== undefined;
  }).length;
  const numericRatio = numericCount / values.length;

  console.log(`列 "${columnName}" 数字检测: ${numericCount}/${values.length} (${(numericRatio * 100).toFixed(1)}%)`);

  if (numericRatio > 0.8) {
    console.log(`列 "${columnName}" 识别为数字`);
    return 'number';
  }

  console.log(`列 "${columnName}" 识别为文本`);
  return 'string';
};

export const groupAndAggregate = (data, groupBy, aggregateBy, aggregateFunc = 'sum') => {
  const grouped = {};

  data.forEach(row => {
    const groupValue = row[groupBy];
    const aggregateValue = parseFloat(row[aggregateBy]) || 0;

    if (!grouped[groupValue]) {
      grouped[groupValue] = {
        sum: 0,
        count: 0,
        values: [],
      };
    }

    grouped[groupValue].values.push(aggregateValue);
    grouped[groupValue].sum += aggregateValue;
    grouped[groupValue].count += 1;
  });

  let result = Object.entries(grouped).map(([key, metrics]) => {
    let aggregatedValue;
    switch (aggregateFunc) {
      case 'sum':
        aggregatedValue = metrics.sum;
        break;
      case 'avg':
        aggregatedValue = metrics.sum / metrics.count;
        break;
      case 'count':
        aggregatedValue = metrics.count;
        break;
      case 'max':
        aggregatedValue = Math.max(...metrics.values);
        break;
      case 'min':
        aggregatedValue = Math.min(...metrics.values);
        break;
      default:
        aggregatedValue = metrics.sum;
    }

    return {
      [groupBy]: key,
      [aggregateBy]: aggregatedValue.toFixed(2),
    };
  });

  result.sort((a, b) => {
    const valA = parseFloat(a[aggregateBy]);
    const valB = parseFloat(b[aggregateBy]);
    return valB - valA;
  });

  return result;
};

export const aggregateByDate = (data, dateColumn, valueColumn, aggregateFunc = 'sum', timeGroup = 'day') => {
  const grouped = {};

  data.forEach(row => {
    const date = parseDate(row[dateColumn]);
    if (!date) return;

    let groupKey;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    switch (timeGroup) {
      case 'year':
        groupKey = `${year}`;
        break;
      case 'quarter':
        const quarter = Math.ceil(month / 3);
        groupKey = `${year}-Q${quarter}`;
        break;
      case 'month':
        groupKey = `${year}-${String(month).padStart(2, '0')}`;
        break;
      case 'week':
        const startDate = new Date(date);
        startDate.setDate(date.getDate() - date.getDay());
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        groupKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')} 至 ${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
        break;
      case 'day':
      default:
        groupKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    const value = parseFloat(row[valueColumn]) || 0;

    if (!grouped[groupKey]) {
      grouped[groupKey] = { sum: 0, count: 0, values: [] };
    }

    grouped[groupKey].values.push(value);
    grouped[groupKey].sum += value;
    grouped[groupKey].count += 1;
  });

  let result = Object.entries(grouped).map(([date, metrics]) => {
    let aggregatedValue;
    switch (aggregateFunc) {
      case 'sum':
        aggregatedValue = metrics.sum;
        break;
      case 'avg':
        aggregatedValue = metrics.sum / metrics.count;
        break;
      case 'count':
        aggregatedValue = metrics.count;
        break;
      case 'max':
        aggregatedValue = Math.max(...metrics.values);
        break;
      case 'min':
        aggregatedValue = Math.min(...metrics.values);
        break;
      default:
        aggregatedValue = metrics.sum;
    }

    return {
      [dateColumn]: date,
      [valueColumn]: aggregatedValue.toFixed(2),
    };
  });

  result.sort((a, b) => {
    const dateA = a[dateColumn].split(' 至 ')[0];
    const dateB = b[dateColumn].split(' 至 ')[0];
    return new Date(dateA) - new Date(dateB);
  });

  return result;
};

export const parseDate = (dateValue) => {
  if (!dateValue) return null;

  let date;

  if (typeof dateValue === 'string') {
    // 检查各种日期格式
    const formats = [
      // 2024-01-01
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
      // 2024-01-01T12:00:00Z
      /^(\d{4})-(\d{1,2})-(\d{1,2})T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
      // 2024年1月1日
      /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
      // 01/01/2024 或 01-01-2024
      /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/,
      // 2024/01/01 或 2024.01.01
      /^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/,
      // 2024-1-1
      /^(\d{4})-(\d{1})-(\d{1})$/,
    ];

    for (const format of formats) {
      const match = dateValue.match(format);
      if (match) {
        // 根据不同的格式解析
        if (format.test(/^\d{4}/)) {
          // YYYY-MM-DD 格式
          date = new Date(match[1], match[2] - 1, match[3]);
        } else {
          // DD-MM-YYYY 格式
          date = new Date(match[3], match[2] - 1, match[1]);
        }

        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // 尝试直接解析
    date = new Date(dateValue);
  } else if (typeof dateValue === 'number') {
    // Excel 日期数字格式 (从 1900-01-01 开始)
    if (dateValue > 25569) {
      date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    } else {
      // 可能是较小的数字年份
      date = new Date(dateValue);
    }
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

export const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};
