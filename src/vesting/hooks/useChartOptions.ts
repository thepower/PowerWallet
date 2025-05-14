import { useCallback, useMemo } from 'react';
import { ChartOptions } from 'chart.js';
import { format } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';

import 'chart.js/auto';

export const useChartOptions = () => {
  const { t } = useTranslation();

  const formatDateLocale = useCallback(
    (date: Date) => {
      return format(date, 'MMM d', {
        locale: i18next.language === 'ru' ? ru : enUS
      });
    },
    [i18next.language]
  );

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d, yyyy'
            },
            tooltipFormat: 'PPP'
          },
          grid: {
            display: false
          },
          ticks: {
            source: 'data',
            autoSkip: true,
            maxTicksLimit: 6,
            callback: (value) => {
              return formatDateLocale(new Date(value));
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(75, 192, 192, 0.1)'
          },
          ticks: {
            callback: (value) => {
              if (typeof value !== 'number') return '';
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
              return value.toFixed(2);
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        title: {
          display: true,
          text: t('vestingSchedule'),
          font: {
            size: 16,
            weight: 500
          },
          padding: {
            bottom: 20
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: {
            size: 13
          },
          bodyFont: {
            size: 12
          },
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (tooltipItems) => {
              const date = new Date(tooltipItems[0].parsed.x);
              return formatDateLocale(date);
            }
          }
        }
      }
    }),
    [t, formatDateLocale]
  );

  return { chartOptions };
};
