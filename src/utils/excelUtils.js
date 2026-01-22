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

  const numericCount = values.filter(val => !isNaN(parseFloat(val))).length;
  const numericRatio = numericCount / values.length;

  if (numericRatio > 0.8) return 'number';

  const dateCount = values.filter(val => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }).length;
  const dateRatio = dateCount / values.length;

  if (dateRatio > 0.8) return 'date';

  return 'string';
};

export const groupAndAggregate = (data, groupBy, aggregateBy, aggregateFunc = 'sum') => {
  const grouped = {};

  data.forEach(row => {
    const groupValue = row[groupBy];
    const aggregateValue = parseFloat(row[aggregateBy]) || 0;

    if (!grouped[groupValue]) {
      grouped[groupValue] = 0;
    }

    switch (aggregateFunc) {
      case 'sum':
        grouped[groupValue] += aggregateValue;
        break;
      case 'count':
        grouped[groupValue] += 1;
        break;
      case 'avg':
        grouped[groupValue] = {
          sum: (grouped[groupValue].sum || 0) + aggregateValue,
          count: (grouped[groupValue].count || 0) + 1,
        };
        break;
      case 'max':
        grouped[groupValue] = Math.max(grouped[groupValue], aggregateValue);
        break;
      case 'min':
        grouped[groupValue] = Math.min(grouped[groupValue], aggregateValue);
        break;
      default:
        grouped[groupValue] += aggregateValue;
    }
  });

  let result = Object.entries(grouped).map(([key, value]) => {
    if (aggregateFunc === 'avg') {
      return {
        [groupBy]: key,
        [aggregateBy]: (value.sum / value.count).toFixed(2),
      };
    }
    return {
      [groupBy]: key,
      [aggregateBy]: aggregateFunc === 'count' ? value : value.toFixed(2),
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
    const date = new Date(row[dateColumn]);
    if (isNaN(date.getTime())) return;

    let groupKey;
    switch (timeGroup) {
      case 'year':
        groupKey = date.getFullYear().toString();
        break;
      case 'month':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'day':
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      default:
        groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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

  result.sort((a, b) => new Date(a[dateColumn]) - new Date(b[dateColumn]));

  return result;
};

export const parseDate = (dateValue) => {
  if (!dateValue) return null;

  let date;
  if (typeof dateValue === 'string') {
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

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};
