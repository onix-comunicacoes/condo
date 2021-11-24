import { OptionProps } from 'antd/lib/mentions'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Select, SelectProps } from 'antd'
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import { useIntl } from '@core/next/intl'
import { InitialValuesGetter, useInitialValueGetter } from './useInitialValueGetter'
import { useSelectCareeteControls } from './useSelectCareeteControls'
import { Loader } from '../Loader'
import { isNeedToLoadNewElements } from '../../utils/select.utils'

const { Option } = Select

const DEBOUNCE_TIMEOUT = 800

interface ISearchInput<S> extends Omit<SelectProps<S>, 'onSelect'> {
    loadOptionsOnFocus?: boolean
    renderOption: (dataItem, value, index?) => React.ReactElement
    // TODO(Dimtireee): remove any
    search: (searchText, skip?) => Promise<Array<Record<string, any>>>
    initialValueGetter?: InitialValuesGetter
    onSelect?: (value: string, option: OptionProps) => void

    infinityScroll?: boolean
}

const SELECT_LOADER_STYLE = { display: 'flex', justifyContent: 'center', padding: '10px 0' }

export const BaseSearchInput = <S extends string>(props: ISearchInput<S>) => {
    const intl = useIntl()
    const LoadingMessage = intl.formatMessage({ id: 'Loading' })
    const NotFoundMessage = intl.formatMessage({ id: 'NotFound' })

    const {
        search,
        autoFocus,
        onBlur,
        onSelect,
        onChange,
        placeholder,
        renderOption,
        initialValueGetter,
        loadOptionsOnFocus = true,
        notFoundContent = NotFoundMessage,
        style,
        infinityScroll,
        value,
        ...restSelectProps
    } = props

    const [selected, setSelected] = useState('')
    const [fetching, setFetching] = useState(false)
    const [data, setData] = useState([])
    const [isAllData, setIsAllData] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [initialOptionsLoaded, setInitialOptionsLoaded] = useState(false)
    const [initialValue, isInitialValueFetching] = useInitialValueGetter(value, initialValueGetter)
    const [scrollInputCaretToEnd, setSelectRef, selectInputNode] = useSelectCareeteControls(restSelectProps.id)

    const searchTextValue = (selected) ? selected + ' ' + value : value

    const searchSuggestions = useCallback(
        async (value) => {
            setIsAllData(false)
            setFetching(true)
            const data = await search(searchTextValue)
            setFetching(false)
            setData(data)
        },
        [],
    )

    const debouncedSearch = useMemo(
        () => {
            return debounce(searchSuggestions, DEBOUNCE_TIMEOUT)
        },
        [searchSuggestions],
    )

    const searchMoreSuggestions = useCallback(
        async (value, skip) => {
            if (isAllData) return

            setFetching(true)
            const data = await search(searchTextValue, skip)
            setFetching(false)

            if (data.length > 0) {
                setData(prevData => [...prevData, ...data])
            } else {
                setIsAllData(true)
            }
        },
        [],
    )

    const throttledSearchMore = useMemo(
        () => {
            return throttle(searchMoreSuggestions, DEBOUNCE_TIMEOUT)
        },
        [searchMoreSuggestions],
    )

    const loadInitialOptions = useCallback(
        (e) => {
            if (props.onFocus) {
                props.onFocus(e)
            }

            if (loadOptionsOnFocus && !initialOptionsLoaded) {
                debouncedSearch(searchValue)
                setInitialOptionsLoaded(true)
            }
        },
        [initialOptionsLoaded],
    )

    const handleSelect = useCallback(
        (value, option) => {
            if (onSelect) {
                props.onSelect(value, option)
            }

            setSelected(option.children)
        },
        [],
    )

    const handleClear = useCallback(
        () => {
            setSelected(null)
            if (props.onClear)
                props.onClear()
        },
        [],
    )

    const handleChange = (value, options) => {
        setSearchValue(value)
        onChange(value, options)
    }

    const handleScroll = useCallback(async (scrollEvent) => {
        const lastElementId = String((data || []).length - 1)

        if (isNeedToLoadNewElements(scrollEvent, lastElementId, fetching)) {
            await throttledSearchMore(value, data.length)
        }
    }, [data, fetching, throttledSearchMore, value])

    useEffect(
        () => {
            setSearchValue(value)
        },
        [value]
    )

    useEffect(
        () => {
            setSearchValue(initialValue)
        },
        [initialValue],
    )

    useEffect(
        () => {
            scrollInputCaretToEnd(selectInputNode)
        },
        [selectInputNode, selected],
    )

    const options = useMemo(
        () => {
            const dataOptions = data.map((option, index) => renderOption(option, value, index))

            return fetching ? [...dataOptions, (
                <Option key={'loader'} value={null} disabled>
                    <Loader style={SELECT_LOADER_STYLE}/>
                </Option>
            )] : dataOptions
        },
        [data, fetching, value],
    )

    return (
        <Select
            showSearch
            autoFocus={autoFocus}
            allowClear
            id={props.id}
            value={isInitialValueFetching ? LoadingMessage : searchValue}
            disabled={Boolean(isInitialValueFetching)}
            onFocus={loadInitialOptions}
            onSearch={debouncedSearch}
            onSelect={handleSelect}
            onBlur={onBlur}
            onChange={handleChange}
            onClear={handleClear}
            onPopupScroll={infinityScroll && handleScroll}
            ref={setSelectRef}
            placeholder={placeholder}
            notFoundContent={fetching ? <Loader size="small" delay={0} fill/> : notFoundContent}
            // TODO(Dimitreee): remove ts ignore after combobox mode will be introduced after ant update
            // @ts-ignore
            mode={'SECRET_COMBOBOX_MODE_DO_NOT_USE'}
            showArrow={false}
            filterOption={false}
            autoClearSearchValue={false}
            defaultActiveFirstOption={false}
            style={style}
        >
            {options}
        </Select>
    )
}