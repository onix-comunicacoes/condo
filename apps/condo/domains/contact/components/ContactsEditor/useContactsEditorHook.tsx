import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Contact } from '../../utils/clientSchema'
import { ContactFields, ContactsEditor, IContactEditorProps } from './index'
import { IContactUIState } from '../../utils/clientSchema/Contact'
import { IOrganizationEmployeeRoleUIState } from '@condo/domains/organization/utils/clientSchema/OrganizationEmployeeRole'

interface IContactsEditorHookArgs {
    // Organization scope for contacts autocomplete and new contact, that can be created
    organization: string,
    role?: IOrganizationEmployeeRoleUIState,
    allowLandLine?: boolean,
}

interface IContactsEditorHookResult {
    createContact: (organization: string, property: string, unitName: string) => Promise<IContactUIState>,
    ContactsEditorComponent: React.FC<IContactEditorProps>,
    // Explicitly indicates, that we have enough data to call `createContact` action
    canCreateContact: boolean,
}

export const useContactsEditorHook = ({ organization, role, allowLandLine }: IContactsEditorHookArgs): IContactsEditorHookResult => {
    // Field value will be initialized only on user interaction.
    // In case of no interaction, no create action will be performed
    // @ts-ignore
    const [contactFields, setContactFields] = useState<ContactFields>({})
    const [shouldCreateContact, setShouldCreateContact] = useState(false)

    // Closure of `createContact` will be broken, when it will be assigned to another constant outside of this hook
    // Refs are used to keep it

    const contactFieldsRef = useRef(contactFields)
    useEffect(() => {
        contactFieldsRef.current = contactFields
    }, [contactFields])

    const shouldCreateContactRef = useRef(shouldCreateContact)
    useEffect(() => {
        shouldCreateContactRef.current = shouldCreateContact
    }, [shouldCreateContact])

    // @ts-ignore
    const createContactAction = Contact.useCreate({}, () => Promise.resolve())

    const handleChangeContact = (values, isNew) => {
        setContactFields(values)
        setShouldCreateContact(isNew)
    }

    const createContact = async (organization, property, unitName) => {
        if (shouldCreateContactRef.current) {
            try {
                return await createContactAction({
                    phone: contactFieldsRef.current.phone,
                    name: contactFieldsRef.current.name,
                    organization,
                    property,
                    unitName,
                })
            } catch (e) {
                // Duplicated contacts should be figured out on the client,
                // and "create" action should not be performed.
                // In case of violation of unique constraint on `Contact` table,
                // be silent for a user, but make a record in log.
                if (e.message.match('Contact_uniq')) {
                    console.error(e)
                } else {
                    throw (e)
                }
            }
        }
    }

    const organizationRef = useRef(organization)
    useEffect(() => {
        organizationRef.current = organization
    }, [organization])

    const roleRef = useRef(role)
    useEffect(() => {
        roleRef.current = role
    }, [role])

    const ContactsEditorComponent: React.FC<IContactEditorProps> = useMemo(() => {
        const ContactsEditorWrapper = (props) => (
            <ContactsEditor
                {...props}
                role={roleRef.current}
                organization={organizationRef.current}
                onChange={handleChangeContact}
                allowLandLine={allowLandLine}
            />
        )
        return ContactsEditorWrapper
    }, [])

    return {
        createContact,
        canCreateContact: !!contactFields.phone && !!contactFields.name,
        ContactsEditorComponent,
    }
}
