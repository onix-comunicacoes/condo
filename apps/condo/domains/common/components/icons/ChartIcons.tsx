import React from 'react'
interface IChartIcon {
    ({ width, height, color }: { width: number; height: number; color?: string }): React.ReactElement
}

const LinearChartIcon: IChartIcon = ({ width = 20, height = 20, color = 'white' }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M21.5846 2.67183C21.7822 2.58949 22 2.73468 22 2.94875V21.4987C22 21.7749 21.7761 21.9987 21.5 21.9987H2.5C2.22386 21.9987 2 21.7749 2 21.4987V9.48416C2 9.26114 2.23469 9.1161 2.43416 9.21583L6 10.9987C6 11.551 6.44772 11.9987 7 11.9987C7.55228 11.9987 8 11.551 8 10.9987L11.1054 9.44606C11.2696 9.77378 11.6085 9.99875 12 9.99875C12.5523 9.99875 13 9.55103 13 8.99875C13 8.72261 12.8881 8.47261 12.7071 8.29164L15.2929 5.70586C15.4739 5.88682 15.7239 5.99875 16 5.99875C16.5523 5.99875 17 5.55103 17 4.99875C17 4.86242 16.9727 4.73246 16.9233 4.61403L21.5846 2.67183Z"
            fill={color}
        />
        <circle cx="7" cy="11" r="0.5" fill={color} />
        <circle cx="12" cy="9" r="0.5" fill={color} />
        <circle cx="16" cy="5" r="0.5" fill={color} />
    </svg>
)

const BarChartIcon: IChartIcon = ({ width = 20, height = 20, color = 'white' }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="8" width="6" height="20" rx="0.3" transform="rotate(-90 2 8)" fill={color} />
        <rect x="2" y="15" width="6" height="14" rx="0.3" transform="rotate(-90 2 15)" fill={color} />
        <rect x="2" y="22" width="6" height="12" rx="0.3" transform="rotate(-90 2 22)" fill={color} />
    </svg>
)

const PieChartIcon: IChartIcon = ({ width = 20, height = 20, color = 'white' }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14.2975 10.8688C14.2354 10.744 14.2513 10.5914 14.3499 10.4928L19.2632 5.57954C19.3851 5.45761 19.5849 5.46311 19.6955 5.59535C21.0057 7.161 21.7953 9.06748 21.9761 11.101C21.9914 11.2728 21.854 11.418 21.6816 11.418H14.7331C14.5937 11.418 14.4745 11.3213 14.4302 11.1892C14.3934 11.0794 14.349 10.9724 14.2975 10.8688Z"
            fill={color}
        />
        <path
            d="M12.0077 9.4519C10.5994 9.4519 9.45362 10.5976 9.45362 12.0058C9.45362 13.1293 10.1831 14.0851 11.1931 14.4259C11.3249 14.4704 11.4213 14.5895 11.4213 14.7287V21.6784C11.4213 21.8508 11.2762 21.9882 11.1044 21.9729C8.77218 21.7656 6.60678 20.758 4.93122 19.0824C3.041 17.1922 2 14.679 2 12.0058C2 9.33274 3.041 6.81957 4.93122 4.92935C6.82144 3.03913 9.33461 1.99813 12.0077 1.99813C14.3774 1.99813 16.6211 2.81675 18.4167 4.31929C18.549 4.42995 18.5545 4.62974 18.4326 4.75167L13.5192 9.66504C13.4206 9.76361 13.268 9.77953 13.1432 9.71739C12.7947 9.54387 12.4083 9.4519 12.0077 9.4519Z"
            fill={color}
        />
        <path
            d="M14.4295 12.8205C14.474 12.6887 14.5931 12.5923 14.7322 12.5923H21.6819C21.8544 12.5923 21.9917 12.7375 21.9765 12.9092C21.7692 15.2414 20.7615 17.4067 19.0858 19.0824C17.4103 20.758 15.245 21.7656 12.9126 21.9729C12.7409 21.9882 12.5957 21.8508 12.5957 21.6784V14.7287C12.5957 14.5895 12.6921 14.4704 12.824 14.4259C13.5779 14.1715 14.175 13.5744 14.4295 12.8205Z"
            fill={color}
        />
    </svg>
)

export { LinearChartIcon, BarChartIcon, PieChartIcon }
