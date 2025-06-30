import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserEventPayload } from '../interfaces/user-event.interface';

@Injectable()
export class UserEvent {

    constructor(
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Émet un événement de la création d'un utilisateur (Demandeur ou Personnel).
     * @param payload Contient l'acteur de l'action et l'utilisateur créé.
     */
    async userCreatedEvent(payload: UserEventPayload) {
        this.eventEmitter.emit(
            'user.created',
            payload
        );
    }

    // La méthode 'memberCreatedEvent' est supprimée car sa logique est désormais
    // gérée par 'userCreatedEvent' en fonction du type d'utilisateur.

    /**
     * Émet un événement de l'activation d'un utilisateur.
     * @param payload Contient l'acteur de l'action et l'utilisateur activé.
     */
    async userActivatedEvent(payload: UserEventPayload) {
        this.eventEmitter.emit(
            'user.activated',
            payload
        );
    }

    /**
     * Émet un événement de la désactivation d'un utilisateur.
     * @param payload Contient l'acteur de l'action et l'utilisateur désactivé.
     */
    async userDeactivatedEvent(payload: UserEventPayload) {
        this.eventEmitter.emit(
            'user.deactivated',
            payload
        );
    }

    /**
     * Émet un événement de la suppression d'un utilisateur.
     * @param payload Contient l'acteur de l'action et l'utilisateur supprimé.
     */
    async userDeletedEvent(payload: UserEventPayload) {
        this.eventEmitter.emit(
            'user.deleted',
            payload
        );
    }
}