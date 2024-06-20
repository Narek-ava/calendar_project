import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { IUser, UserAction, UserPermission, UserSubject } from '../../models/IUser';

export type AppAbilityType = Ability<[UserAction | '*', UserSubject]>;
export const AppAbility = Ability as AbilityClass<AppAbilityType>;
export const baseUserActions = ['create', 'view', 'list', 'update', 'delete', 'restore'] as UserAction[];

export default function defineRulesFor(user: IUser) {
    const { can, rules } = new AbilityBuilder(AppAbility);
    const {
        employee: {
            role: { permissions }
        }
    } = user;

    permissions.forEach(({ action, subject }: UserPermission) => {
        if (action === '*') {
            baseUserActions.forEach((baseAction) => {
                can(baseAction, subject);
            });
        } else {
            can(action, subject);
        }
    });

    return rules;
}

export function buildAbilityFor(user: IUser): AppAbilityType {
    return new AppAbility(defineRulesFor(user));
}
