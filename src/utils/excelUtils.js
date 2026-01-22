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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
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

  const numericCount = values.filter(val => !isNaN(parseFloat(val)) && !isNaN(parseFloat(val).toString())).length;
  const numericRatio = numericCount / values.length;

  if (numericRatio > 0.8) return 'number';

  const dateCount = values.filter(val => {
    const date = parseDate(val);
    return date !== null;
  }).length;
  const dateRatio = dateCount / values.length;

  if (dateRatio > 0.6) return 'date';

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
    const formats = [
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,
      /^(\d{4})-(\d{1,2})-(\d{1,2})T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
      /^(\d{4})年(\d{1,2})月(\d{1,2})日$/,
    ];

    for (const format of formats) {
      const match = dateValue.match(format);
      if (match) {
        date = new Date(match[1], match[2] - 1, match[3]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    date = new Date(dateValue);
  } else if (typeof dateValue === 'number') {
    date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
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
