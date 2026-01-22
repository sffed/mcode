import React, { useRef } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, BarChart2, LineChart as LineChartIcon, PieChart as PieChartIcon, ScatterChart as ScatterChartIcon } from 'lucide-react';
import html2canvas from 'html2canvas';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

const ChartDisplay = ({ data, chartType, groupBy, aggregateBy, xAxisTitle, yAxisTitle, showGrid, showLegend }) => {
  const chartRef = useRef(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <BarChart2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">暂无数据，请配置图表选项</p>
      </div>
    );
  }

  const handleDownloadImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `chart-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('下载失败:', error);
      }
    }
  };

  const renderChart = () => {
    const chartData = data.map((item, index) => ({
      name: item[groupBy],
      value: parseFloat(item[aggregateBy]),
      fill: COLORS[index % COLORS.length],
    }));

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey="name"
              label={{ value: xAxisTitle, position: 'insideBottom', offset: -40 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: yAxisTitle, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey="name"
              label={{ value: xAxisTitle, position: 'insideBottom', offset: -40 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: yAxisTitle, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey="name"
              label={{ value: xAxisTitle, position: 'insideBottom', offset: -40 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: yAxisTitle, angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            {showLegend && <Legend />}
            <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend verticalAlign="bottom" height={36} />}
          </PieChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey="name"
              label={{ value: xAxisTitle, position: 'insideBottom', offset: -40 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis label={{ value: yAxisTitle, angle: -90, position: 'insideLeft' }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            {showLegend && <Legend />}
            <Scatter name="数据点" data={chartData} fill="#3B82F6" shape="circle" />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (chartType) {
      case 'bar':
        return <BarChart2 className="w-6 h-6" />;
      case 'line':
        return <LineChartIcon className="w-6 h-6" />;
      case 'area':
        return <AreaChartIcon className="w-6 h-6" />;
      case 'pie':
        return <PieChartIcon className="w-6 h-6" />;
      case 'scatter':
        return <ScatterChartIcon className="w-6 h-6" />;
      default:
        return <BarChart2 className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {getChartIcon()}
          <h2 className="text-lg font-semibold text-gray-800">图表预览</h2>
        </div>
        <button
          onClick={handleDownloadImage}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="下载为图片"
        >
          <Download className="w-4 h-4" />
          保存图片
        </button>
      </div>

      <div ref={chartRef} className="w-full h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
        <div>
          <span className="font-medium">数据点数:</span> {data.length}
        </div>
        <div>
          <span className="font-medium">总记录数:</span> {data.reduce((sum, item) => sum + parseFloat(item[aggregateBy] || 0), 0).toFixed(2)}
        </div>
      </div>
    </div>
  );
};

const AreaChartIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
);

export default ChartDisplay;
