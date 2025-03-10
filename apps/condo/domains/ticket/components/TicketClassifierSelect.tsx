import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Select, Input, Col, Form, Row } from 'antd'
const { Option } = Select
import { useApolloClient } from '@core/next/apollo'
import { useIntl } from '@core/next/intl'
import { uniqBy, isEmpty, find, pick, get } from 'lodash'
import { ClassifiersQueryLocal, ClassifiersQueryRemote, TicketClassifierTypes } from '@condo/domains/ticket/utils/clientSchema/classifierSearch'
import { useTicketValidations } from '@condo/domains/ticket/components/BaseTicketForm/useTicketValidations'
import { Gutter } from 'antd/es/grid/row'
import { TicketFormItem } from './BaseTicketForm'

interface Options {
    id: string
    name: string
}
interface ITicketThreeLevelsClassifierHookInput {
    initialValues: {
        classifierRule: string
        placeClassifier: string
        categoryClassifier: string
        problemClassifier?: string
    }
}
interface ITicketThreeLevelsClassifierHookOutput {
    ClassifiersEditorComponent: React.FC<{ form, disabled }>
}

interface ITicketClassifierSelectHookInput {
    onChange: (id: string) => void
    onSearch: (id: string) => void
    initialValue: string | null
}

type ClassifierSelectComponent = React.FC<{ disabled?: boolean, style?: React.CSSProperties, value?: string }>
interface ITicketClassifierSelectHookOutput {
    set: {
        all: React.Dispatch<React.SetStateAction<Options[]>>
        one: React.Dispatch<React.SetStateAction<string>>
        search: React.Dispatch<React.SetStateAction<Options[]>>
    }
    SelectComponent: ClassifierSelectComponent
    ref: React.MutableRefObject<HTMLSelectElement>
}

const useTicketClassifierSelectHook = ({
    onChange,
    onSearch,
    initialValue,
}: ITicketClassifierSelectHookInput): ITicketClassifierSelectHookOutput => {
    const intl = useIntl()
    const SelectMessage = intl.formatMessage({ id: 'Select' })

    const [classifiers, setClassifiersFromRules] = useState<Options[]>([])
    const [searchClassifiers, setSearchClassifiers] = useState<Options[]>([])
    const classifiersRef = useRef<HTMLSelectElement>(null)
    const optionsRef = useRef<Options[]>([])
    const selectedRef = useRef<string>(null)

    const setClassifiers = (classifiers) => {
        setClassifiersFromRules(classifiers)
        // We need to remove search classifiers when rules start to work
        setSearchClassifiers([])
    }

    function setSelected (value) {
        selectedRef.current = value
        // Remove search classifiers when user chosen smth - only classifiers will work for now
        setSearchClassifiers([])
    }

    useEffect(() => {
        optionsRef.current = uniqBy([...classifiers, ...searchClassifiers], 'id')
    }, [classifiers, searchClassifiers])

    const SelectComponent = useMemo(() => {
        const SelectComponentWrapper: ClassifierSelectComponent = (props) => {
            const { disabled, style } = props
            return (
                <Select
                    showSearch
                    style={style}
                    allowClear={true}
                    onSelect={onChange}
                    onSearch={onSearch}
                    onClear={() => onChange(null)}
                    optionFilterProp={'title'}
                    defaultActiveFirstOption={false}
                    disabled={disabled}
                    defaultValue={initialValue}
                    ref={classifiersRef}
                    value={selectedRef.current}
                    showAction={['focus', 'click']}
                    placeholder={SelectMessage}
                >
                    {
                        optionsRef.current.map(classifier => (
                            <Option value={classifier.id} key={classifier.id} title={classifier.name}>{classifier.name}</Option>
                        ))
                    }

                </Select>
            )
        }
        return SelectComponentWrapper
    }, [initialValue, onSearch, onChange])

    return {
        SelectComponent,
        set: {
            all: setClassifiers,
            one: setSelected,
            search: setSearchClassifiers,
        },
        ref: classifiersRef,
    }
}

const CLASSIFIER_ROW_GUTTER: [Gutter, Gutter] = [40, 10]

export const useTicketThreeLevelsClassifierHook = ({ initialValues: {
    classifierRule,
    placeClassifier,
    categoryClassifier,
    problemClassifier,
} }: ITicketThreeLevelsClassifierHookInput): ITicketThreeLevelsClassifierHookOutput => {
    const intl = useIntl()
    const PlaceClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.PlaceLabel' })
    const CategoryClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.CategoryLabel' })
    const ProblemClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.ProblemLabel' })
    const ruleRef = useRef({ id: classifierRule, place: null, category:null, problem: null })
    const client = useApolloClient()
    const ClassifierLoader = new ClassifiersQueryLocal(client)
    const validations = useTicketValidations()
    const ticketForm = useRef(null)

    const onUserSelect = (id, type) => {
        const clearProblem = (id === null && type !== 'problem') ? { problem: null } : {}
        ruleRef.current = { ...ruleRef.current, [type]: id, ...clearProblem }
        updateLevels({ [type]: id })
    }

    const onUserSearch = async (input, type) => {
        const classifiers = await ClassifierLoader.search(input, type)
        Setter[type].search(classifiers)
    }

    const {
        set: problemSet,
        SelectComponent: ProblemSelect,
        ref: problemRef,
    } = useTicketClassifierSelectHook({
        onChange: (id) => onUserSelect(id, TicketClassifierTypes.problem),
        onSearch: (id) => onUserSearch(id, TicketClassifierTypes.problem),
        initialValue: problemClassifier,
    })

    const {
        set: categorySet,
        SelectComponent: CategorySelect,
        ref: categoryRef,
    } = useTicketClassifierSelectHook({
        onChange: (id) => onUserSelect(id, TicketClassifierTypes.category),
        onSearch: (id) => onUserSearch(id, TicketClassifierTypes.category),
        initialValue: categoryClassifier,
    })

    const {
        set: placeSet,
        SelectComponent: PlaceSelect,
        ref: placeRef,
    } = useTicketClassifierSelectHook({
        onChange: (id) => onUserSelect(id, TicketClassifierTypes.place),
        onSearch: (id) => onUserSearch(id, TicketClassifierTypes.place),
        initialValue: placeClassifier,
    })

    const Setter = {
        place: placeSet,
        category: categorySet,
        problem: problemSet,
    }

    const Refs = {
        place: placeRef,
        category: categoryRef,
        problem: problemRef,
    }

    useEffect(() => {
        ClassifierLoader.init().then(() => {
            if (ruleRef.current.id) {
                ClassifierLoader.findRules({ id: ruleRef.current.id }).then(([rule]) => {
                    const { place, category, problem } = rule
                    ruleRef.current = { ...ruleRef.current, ...{ place: place.id, category: category.id, problem: get(problem, 'id', null) } }
                    updateLevels(ruleRef.current)
                })
            } else {
                // fill options on empty classifier
                [TicketClassifierTypes.place, TicketClassifierTypes.category].forEach(type => {
                    ClassifierLoader.search('', type).then(classifiers => {
                        Setter[type].all(classifiers)
                    })
                })
            }
        })
        return () => {
            // clear all loaded data from helper
            ClassifierLoader.clear()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // We build options for every select with care - not to break selection
    // that's why we are making 3 requests here with Promise.all
    // For example, all 3 levels are set - in this case, we have only one matching rule and the number of options on every select will be exactly 1
    // So when we build options for place => we make query with { category: set, problem: set, place: not set}
    // Now we have all possible options for places that will not break selection in the category select and problem select  after choosing
    // Same thing for all selects
    const loadLevels = async () => {
        const { place, category, problem } = ruleRef.current
        const loadedRules = await Promise.all([
            { category, problem, type: 'place' },
            { place, problem, type: 'category' },
            { place, category, type: 'problem' },
        ].map(selector => {
            const { type, ...querySelectors } = selector
            return new Promise<[string, Options[]]>(resolve => {
                const query = {}
                for (const key in querySelectors) {
                    if (querySelectors[key]) {
                        query[key] = { id: querySelectors[key] }
                    }
                }
                ClassifierLoader.findRules(query).then(data => resolve([type, ClassifierLoader.rulesToOptions(data, type)]))
            })
        }))
        const result = Object.fromEntries(loadedRules)
        return result
    }

    const openSelect = (ref) => {
        if (ref.current) {
            ref.current.blur()
            setTimeout(ref.current.focus, 0)
        }
    }

    // Every time user choose some option from select we are trying to find what exact rule is matching for this combination
    // When place and category are chosen we set rule with problem=null
    const updateRuleId = async () => {
        const querySelectors = pick(ruleRef.current, ['place', 'category', 'problem'])
        const query = {}
        for (const key in querySelectors) {
            if (querySelectors[key]) {
                query[key] = { id: querySelectors[key] }
            }
        }
        const matchingRules = await ClassifierLoader.findRules(query)
        if (matchingRules.length === 1) {
            ruleRef.current = { ...ruleRef.current, id: matchingRules[0].id }
        } else if (ruleRef.current.place && ruleRef.current.category) {
            const withEmptyProblem = find(matchingRules, { problem: null })
            if (withEmptyProblem){
                ruleRef.current = { ...ruleRef.current, id: withEmptyProblem.id }
            }
        }
        ticketForm.current.setFields([
            { name: 'classifierRule', value: ruleRef.current.id },
            { name: 'placeClassifier', value: ruleRef.current.place },
            { name: 'categoryClassifier', value: ruleRef.current.category },
            { name: 'problemClassifier', value: ruleRef.current.problem },
        ])
    }
    // We need to find out whether user is still following classifiers rules
    // or he just make a search in one of a selects and runied all dependencies
    // so we load rules and search if selected value still presence in options
    // if not => we set all not matching selects values to null
    const updateLevels = async (selected = {}, maxUpdates = 2 ) => {
        ruleRef.current = { ...ruleRef.current, ...selected }
        const options = await loadLevels()
        const state = ruleRef.current
        const updateEmptyState = {}
        Object.keys(Setter).forEach(type => {
            const isExisted = options[type].find(option => option.id === state[type])
            if (!isExisted && state[type]) {
                updateEmptyState[type] = null
            }
        })
        if (!isEmpty(updateEmptyState)) {
            // here we need to rebuild all options except selected
            for (const type in updateEmptyState) {
                Refs[type].setV
            }
            ruleRef.current = { ...ruleRef.current, ...updateEmptyState, id: null, ...selected }
            if (maxUpdates > 0) {
                return await updateLevels(selected, --maxUpdates)
            }
        }
        Object.keys(Setter).forEach(type => {
            Setter[type].all(options[type])
            const isExisted = options[type].find(option => option.id === state[type])
            Setter[type].one(isExisted ? state[type] : null)
        })
        await updateRuleId()
        if (!state.place && state.category) {
            openSelect(placeRef)
        } else if (!state.category && state.place) {
            openSelect(categoryRef)
        }
    }

    const ClassifiersEditorComponent = useMemo(() => {
        const ClassifiersEditorWrapper: React.FC<{ form, disabled }> = ({ form, disabled }) => {
            ticketForm.current = form
            return (
                <Row gutter={CLASSIFIER_ROW_GUTTER}>
                    <Form.Item name={'classifierRule'} rules={validations.classifierRule} noStyle={true}>
                        <Input type='hidden'></Input>
                    </Form.Item>
                    <Col span={12}>
                        <TicketFormItem
                            label={PlaceClassifierLabel}
                            name={'placeClassifier'}
                            rules={validations.placeClassifier}
                        >
                            <PlaceSelect disabled={disabled} />
                        </TicketFormItem>
                    </Col>
                    <Col span={12}>
                        <TicketFormItem
                            label={CategoryClassifierLabel}
                            name={'categoryClassifier'}
                            rules={validations.categoryClassifier}
                        >
                            <CategorySelect disabled={disabled} />
                        </TicketFormItem>
                    </Col>
                    <Col span={24}>
                        <TicketFormItem
                            name={'problemClassifier'}
                            label={ProblemClassifierLabel}
                        >
                            <ProblemSelect disabled={disabled} />
                        </TicketFormItem>
                    </Col>
                </Row>
            )
        }
        return ClassifiersEditorWrapper
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return {
        ClassifiersEditorComponent,
    }
}
