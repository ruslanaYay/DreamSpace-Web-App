package com.dreamspace.api.service;

import com.dreamspace.api.dto.*;
import com.dreamspace.api.entity.Reservation;
import com.dreamspace.api.entity.ReservationParticipant;
import com.dreamspace.api.entity.User;
import com.dreamspace.api.entity.Wish;
import com.dreamspace.api.entity.Wishlist;
import com.dreamspace.api.enums.PrivacyStatus;
import com.dreamspace.api.enums.ReservationType;
import com.dreamspace.api.exception.*;
import com.dreamspace.api.mapper.WishResponseMapper;
import com.dreamspace.api.repository.ReservationParticipantRepository;
import com.dreamspace.api.repository.ReservationRepository;
import com.dreamspace.api.repository.UserRepository;
import com.dreamspace.api.repository.WishRepository;
import com.dreamspace.api.repository.WishlistRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class WishlistShareService {

    private final WishlistRepository wishlistRepository;
    private final WishlistService wishlistService;
    private final WishRepository wishRepository;
    private final UserRepository userRepository;
    private final WishResponseMapper wishResponseMapper;
    private final ReservationRepository reservationRepository;
    private final ReservationParticipantRepository reservationParticipantRepository;

    public WishlistShareService(WishlistRepository wishlistRepository,
                                WishlistService wishlistService,
                                WishRepository wishRepository,
                                UserRepository userRepository,
                                WishResponseMapper wishResponseMapper,
                                ReservationRepository reservationRepository,
                                ReservationParticipantRepository reservationParticipantRepository) {
        this.wishlistRepository = wishlistRepository;
        this.wishlistService = wishlistService;
        this.wishRepository = wishRepository;
        this.userRepository = userRepository;
        this.wishResponseMapper = wishResponseMapper;
        this.reservationRepository = reservationRepository;
        this.reservationParticipantRepository = reservationParticipantRepository;
    }

    public SharedWishlistResponseDto getWishlistByShareToken(String shareToken) {

        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {

            currentUsername = authentication.getName();

            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }

        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }

        WishlistDetailsDTO baseDto = wishlistService.getWishlistDetails(wishlist.getId(), currentUsername);

        return new SharedWishlistResponseDto(baseDto, isOwner);
    }

    @Transactional(readOnly = true)
    public PageResponseDTO<WishResponseDTO> getSharedWishlistWishes(String shareToken, int page, int size){
        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;
        Long currentUserId = null;
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();

            currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);
            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }
        if (page < 0) {page = 0;}
        if (size <= 0) {size = 15;}
        if (size > 15) {size = 15;}

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Wish> wishesPage = wishRepository.findAllByWishlist_Id(wishlist.getId(), pageable);

        final Long finalUserId = currentUserId;
        final boolean finalIsOwner = isOwner;
        Page<WishResponseDTO> dtoPage = wishesPage.map(wish -> wishResponseMapper.toDTO(wish, finalUserId, finalIsOwner, false));
        return new PageResponseDTO<>(dtoPage);
    }

    @Transactional(readOnly = true)
    public SharedWishResponseDTO getSharedWishDetails(String shareToken, Long id){
        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isOwner = false;
        String currentUsername = null;

        Long currentUserId = null;
        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();

            currentUserId = userRepository.findByEmail(currentUsername).map(User::getId).orElse(null);
            if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentUsername)) {
                isOwner = true;
            }
        }
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Ви не можете переглядати цей вішліст");
        }

        Wish wish = wishRepository.findByIdAndWishlist_ShareToken(id, shareToken)
                .orElseThrow(() -> new WishNotFoundException());
        WishResponseDTO dto = wishResponseMapper.toDTO(wish, currentUserId, isOwner,true);
        return new SharedWishResponseDTO(dto, isOwner);
    }

    @Transactional
    public ReservationResponseDTO reserveWish(String shareToken, Long wishId, ReservationRequestDTO requestDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис");
        }

        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());

        Wish wish = wishRepository.findById(wishId)
                .orElseThrow(() -> new WishNotFoundException());

        Wishlist wishlist = wish.getWishlist();

        if (!wishlist.getShareToken().equals(shareToken)) {
            throw new WishNotFoundException();
        }

        boolean isOwner = wishlist.getUser() != null && wishlist.getUser().getId().equals(currentUser.getId());

        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Доступ заборонено");
        }

        if (isOwner) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }

        if (wish.getIsCompleted() || wish.getReservation() != null) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }
        if (ReservationType.GROUP.equals(requestDto.getReservationType())){
            Map<String, String> validationErrors = new HashMap<>();
            String inputEmail = requestDto.getEmail();
            //перевірка пошти
            if (inputEmail == null || inputEmail.trim().isEmpty()) {
                validationErrors.put("email", "Це поле обов’язкове");
            } else {
                String emailRegex = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
                if (!inputEmail.matches(emailRegex)) {
                    validationErrors.put("email", "Некоректна адреса електронної пошти");
                }
            }
            //перевірка кількості учасників
            Integer maxParticipants = requestDto.getMaxParticipants();
            if (maxParticipants == null){
                validationErrors.put("maxParticipants", "Це поле обов’язкове");
            }
            else if (maxParticipants <= 1) {
                validationErrors.put("maxParticipants", "Введіть значення більше 1 або перейдіть в одиночний режим");
            }
            else if(maxParticipants > 10) {
                validationErrors.put("maxParticipants", "Кількість дарувальників повинна бути не більше 10 осіб");
            }
            if (!validationErrors.isEmpty()) {
                throw new ValidationException(validationErrors);
            }
        }

        Reservation reservation = new Reservation(
                wish,
                currentUser,
                requestDto.getReservationType(),
                requestDto.getMaxParticipants()
        );
        reservation = reservationRepository.save(reservation);

        String participantEmail = ReservationType.GROUP.equals(requestDto.getReservationType())
                ? requestDto.getEmail().trim()
                : currentUser.getEmail();

        ReservationParticipant participant = new ReservationParticipant(
                reservation,
                currentUser,
                participantEmail
        );

        reservationParticipantRepository.save(participant);

        return new ReservationResponseDTO(
                reservation.getId(),
                wish.getId(),
                reservation.getReservationType(),
                reservation.getMaxParticipants(),
                1
        );
    }
    @Transactional
    public ReservationResponseDTO joinReservation(String shareToken, Long wishId, JoinReservationRequestDTO requestDto) {
        Wishlist wishlist = wishlistRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new WishlistNotFoundException());
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
            throw new AccessDeniedException("Увійдіть в обліковий запис");
        }
        boolean isOwner = false;
        String currentEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new UserNotFoundException());
        if (wishlist.getUser() != null && wishlist.getUser().getEmail().equals(currentEmail)) {
            isOwner = true;
        }
        if (wishlist.getPrivacyStatus() == PrivacyStatus.PRIVATE && !isOwner) {
            throw new AccessDeniedException("Доступ заборонено");
        }
        Wish wish = wishRepository.findByIdAndWishlist_ShareToken(wishId, shareToken)
                .orElseThrow(() -> new WishNotFoundException());

        //специфічні перевірки
        if (isOwner) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }

        if (wish.getIsCompleted()) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }
        Reservation reservation = reservationRepository.findByWish_Id(wishId)
                .orElseThrow(() ->
                        new BadRequestException("Ви не можете забронювати це бажання"));

        if (ReservationType.INDIVIDUAL.equals(reservation.getReservationType())) {
            throw new BadRequestException("Ви не можете забронювати це бажання");
        }
        Map<String, String> validationErrors = new HashMap<>();
        //перевірка пошти
        String cleanedEmail = null;
        if (requestDto.getEmail() == null || requestDto.getEmail().trim().isEmpty()) {
            validationErrors.put("email", "Це поле обов’язкове");
        } else {
            cleanedEmail = requestDto.getEmail().trim();
            String emailRegex = "^[a-zA-Z0-9_!#$%&'*+/=?`{|}~^.-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
            if (!cleanedEmail.matches(emailRegex)) {
                validationErrors.put("email", "Некоректна адреса електронної пошти");
            }
        }
        if (!validationErrors.isEmpty()) {
            throw new ValidationException(validationErrors);
        }
        //перевірка вільних місць
        int currentParticipants = reservationParticipantRepository.countByReservationId(reservation.getId());
        if (currentParticipants >= reservation.getMaxParticipants()) {
            throw new BadRequestException("Всі місця вже зайняті");
        }
        //перевірка, чи поточний користувач або введена пошта вже є серед учасників цього бронювання
        boolean alreadyParticipant = reservationParticipantRepository.existsByReservationIdAndUserId(reservation.getId(), currentUser.getId());
        if (alreadyParticipant) {
            throw new BadRequestException("Ви вже є учасником цього бронювання");
        }
        boolean emailAlreadyUsed = reservationParticipantRepository.existsByReservationIdAndEmailIgnoreCase(reservation.getId(), cleanedEmail);
        if (emailAlreadyUsed) {
            throw new BadRequestException("Ви вже є учасником цього бронювання");
        }
        //збереження учасника
        ReservationParticipant participant = new ReservationParticipant(reservation, currentUser, cleanedEmail);
        reservationParticipantRepository.save(participant);

        return new ReservationResponseDTO(
                reservation.getId(),
                wish.getId(),
                reservation.getReservationType(),
                reservation.getMaxParticipants(),
                currentParticipants + 1
        );

    }
}